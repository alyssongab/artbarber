import { AppointmentRepository } from './appointments.repository.ts';
import type { GetAvailabilityInput } from './appointment.types.ts';
import { BUSINESS_HOURS } from '../../shared/config/business-hours.ts';
import { UserRepository } from '../users/user.repository.ts';
import { NotFoundError, ForbiddenError } from '../../shared/errors/http.errors.ts';

export class AvailabilityService {
    private appointmentRepository: AppointmentRepository;
    private userRepository: UserRepository;

    constructor(){
        this.appointmentRepository = new AppointmentRepository();
        this.userRepository = new UserRepository();
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

        // Parse date properly to Date object
        const dateObject = new Date(`${appointment_date}T00:00:00.000Z`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if the requested date is today
        const isToday = dateObject.getTime() === today.getTime();

        // 1. Generate all possible time slots based on business hours
        const allSlots = this.generateTimeSlots(isToday);

        // 2. Fetch existing appointments for the barber on the given date
        const appointments = await this.appointmentRepository.findByDateAndBarber(
            dateObject,
            id_barber
        );

        // 3. Extract booked times using UTC methods (not local timezone)
        const bookedTimes = appointments.map(apt => {
            const time = new Date(apt.appointment_time);
            return `${time.getUTCHours().toString().padStart(2, '0')}:${time.getUTCMinutes().toString().padStart(2, '0')}`;
        });

        // 4. Remove booked times from all slots to get available slots
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

        let currentTime = new Date();
        currentTime.setHours(openHour, openMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(closeHour, closeMinute, 0, 0);

        // If it's today, calculate minimum start time (now + 30 minutes)
        let minimumTime: Date | null = null;
        if (isToday) {
            minimumTime = new Date();
            minimumTime.setMinutes(minimumTime.getMinutes() + 30);
            
            // If minimum time is after business closing, return empty array (no slots available today)
            if (minimumTime >= endTime) {
                return [];
            }
            
            // If minimum time is before opening, start from opening
            if (minimumTime < currentTime) {
                minimumTime = null; // No need to filter, start from opening
            }
        }

        while (currentTime < endTime) {
            const hours = currentTime.getHours().toString().padStart(2, '0');
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
            
            // Only add slot if it's not today, or if it's after the minimum time
            if (!minimumTime || currentTime >= minimumTime) {
                slots.push(`${hours}:${minutes}`);
            }

            currentTime.setMinutes(currentTime.getMinutes() + BUSINESS_HOURS.SLOT_INTERVAL);
        }

        return slots;
    }
}

export default AvailabilityService;