import { AppointmentRepository } from './appointments.repository.ts';
import type { GetAvailabilityInput } from './appointment.types.ts';
import { BUSINESS_HOURS } from '../../shared/config/business-hours.ts';

export class AvailabilityService {
    private appointmentRepository: AppointmentRepository;

    constructor(){
        this.appointmentRepository = new AppointmentRepository();
    }

    async getAvailableHours(input: GetAvailabilityInput): Promise<string[]> {
        const { appointment_date, id_barber } = input;

        // 1.Generate all possible time slots based on business hours
        const allSlots = this.generateTimeSlots();

        // 2. Fetch existing appointments for the barber on the given date
        // Parse date properly to Date object
        const dateObject = new Date(`${appointment_date}T00:00:00.000Z`);

        const appointments = await this.appointmentRepository.findByDateAndBarber(
            dateObject,
            id_barber
        );

        // 3. Extract booked times from appointments in format "HH:mm"
        const bookedTimes = appointments.map(apt => {
            const time = new Date(apt.appointment_time);
            return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        });

        // 4. Remove booked times from all slots to get available slots
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

        return availableSlots;
    }

    /**
     * Generate all time slots between OPEN and CLOSE
     * @returns Array of strings in the format "HH:mm"
     */
    private generateTimeSlots(): string[] {
        const slots: string[] = [];
        const [openHour, openMinute] = BUSINESS_HOURS.OPEN.split(':').map(Number) as [number, number];
        const [closeHour, closeMinute] = BUSINESS_HOURS.CLOSE.split(':').map(Number) as [number, number];

        let currentTime = new Date();
        currentTime.setHours(openHour, openMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(closeHour, closeMinute, 0, 0);

        while (currentTime < endTime) {
            const hours = currentTime.getHours().toString().padStart(2, '0');
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
            slots.push(`${hours}:${minutes}`);

            currentTime.setMinutes(currentTime.getMinutes() + BUSINESS_HOURS.SLOT_INTERVAL);
        }

        return slots;
    }
}

export default AvailabilityService;