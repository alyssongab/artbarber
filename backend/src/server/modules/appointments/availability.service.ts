import { AppointmentRepository } from './appointments.repository.ts';
import type { GetAvailabilityInput } from './appointment.types.ts';
import { BUSINESS_HOURS } from '../../shared/config/business-hours.ts';
import { UserRepository } from '../users/user.repository.ts';
import { NotFoundError, ForbiddenError } from '../../shared/errors/http.errors.ts';

export class AvailabilityService {
    private appointmentRepository: AppointmentRepository;
    private userRepository: UserRepository;

    constructor(appointmentRepository: AppointmentRepository,
                userRepository: UserRepository
    ){
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    async getAvailableHours(input: GetAvailabilityInput): Promise<string[]> {
        const { appointment_date, id_barber } = input;

        // Verify that the user exists and is a barber
        const user = await this.userRepository.findById(id_barber);
        
        if (!user) {
            throw new NotFoundError("Barbeiro não encontrado.");
        }
        
        if (user.role !== 'BARBER') {
            throw new ForbiddenError("O usuário informado não é um barbeiro.");
        }

        // Input date comes in "YYYY-MM-DD" format.
        const dateObject = new Date(`${appointment_date}T00:00:00.000Z`);
        
        // Gets today date to compare.
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const isToday = dateObject.getTime() === todayUTC.getTime();

        const allSlots = this.generateTimeSlots(isToday);

        const appointments = await this.appointmentRepository.findAllByDateAndBarber(
            dateObject,
            id_barber
        );

        // Get the busy times using UTC methods
        const bookedTimes = appointments.map(apt => {
            const time = new Date(apt.appointment_datetime);
            return `${time.getUTCHours().toString().padStart(2, '0')}:${time.getUTCMinutes().toString().padStart(2, '0')}`;
        });

        // Remove busy times to get only the available ones
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

        return availableSlots;
    }

    /**
     * Generate all time slots between OPEN and CLOSE
     * If isToday is true, only return slots starting from 30 minutes from now
     * @param isToday - Whether the slots are for today
     * @returns Array of strings in the format "HH:mm"
     */
    private generateTimeSlots(isToday: boolean = false): string[] {
        const slots: string[] = [];
        const [openHour, openMinute] = BUSINESS_HOURS.OPEN.split(':').map(Number) as [number, number];
        const [closeHour, closeMinute] = BUSINESS_HOURS.CLOSE.split(':').map(Number) as [number, number];
        const [lunchStartHour, lunchStartMinute] = BUSINESS_HOURS.LUNCH_TIME.split(':').map(Number) as [number, number];
        const [lunchEndHour, lunchEndMinute] = BUSINESS_HOURS.BACK_TO_WORK_TIME.split(':').map(Number) as [number, number];

        // UTC
        const now = new Date();
        const currentTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), openHour, openMinute));
        const endTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), closeHour, closeMinute));
        
        // Lunch break times
        const lunchStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), lunchStartHour, lunchStartMinute));
        const lunchEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), lunchEndHour, lunchEndMinute));

        let minimumTime: Date | null = null;
        if (isToday) {
            minimumTime = new Date(now.getTime() + 30 * 60 * 1000);
            
            if (minimumTime >= endTime) {
                return [];
            }
            
            if (minimumTime < currentTime) {
                minimumTime = null; 
            }
        }

        while (currentTime < endTime) {
            // Skip lunch break hours
            const isLunchTime = currentTime >= lunchStart && currentTime < lunchEnd;
            
            if (!isLunchTime) {
                const hours = currentTime.getUTCHours().toString().padStart(2, '0');
                const minutes = currentTime.getUTCMinutes().toString().padStart(2, '0');
                
                if (!minimumTime || currentTime >= minimumTime) {
                    slots.push(`${hours}:${minutes}`);
                }
            }

            currentTime.setUTCMinutes(currentTime.getUTCMinutes() + BUSINESS_HOURS.SLOT_INTERVAL);
        }

        return slots;
    }
}

export default AvailabilityService;