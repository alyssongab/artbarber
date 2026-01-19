import { CronJob } from 'cron'; 
import { AppointmentRepository } from '../appointments/appointments.repository.ts';

export class AppointmentAutoCancelService {
    private appointmentRepository: AppointmentRepository;

    constructor() {
        this.appointmentRepository = new AppointmentRepository();
    }
  /**
   * cancel appointments that expired the time limit (10min)
   */
  async cancelExpiredAppointments() {
    // Current time minus 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    console.log(`[AUTO-CANCEL] Verificando appointments pendentes até ${tenMinutesAgo.toISOString()}...`);

    try {
      // Find appointments that are expired (more than 10min past appointment_datetime)
      const expiredAppointments = await this.appointmentRepository.findExpiredPendingAppointments(
        tenMinutesAgo
      );

      if (expiredAppointments.length === 0) {
        console.log('[AUTO-CANCEL] Nenhum agendamento expirado encontrado.');
        return { cancelled: 0, appointments: [] };
      }

      // Cancel all expired appointments
      const cancelledCount = await this.appointmentRepository.cancelExpiredAppointments(
        tenMinutesAgo
      );

      console.log(`[AUTO-CANCEL] 🟡 ${cancelledCount} agendamentos cancelados por não comparecimento.`);

      // notify clients (commented out - implement if needed)
      // for (const apt of expiredAppointments) {
      //   if (apt.client) {
      //     await notificationService.sendNoShow(apt.client.phone_number, apt);
      //   }
      // }

      return { 
        cancelled: cancelledCount, 
        appointments: expiredAppointments 
      };
    } catch (error) {
      console.error('[AUTO-CANCEL] ❌ Erro ao cancelar appointments:', error);
      throw error;
    }
  }

  startCronJob() {  
    // each 5min
    const job = CronJob.from({
      cronTime: '*/5 * * * *',
      onTick: async () => {
        try {
          await this.cancelExpiredAppointments();
        } catch (error) {
          console.error('[CRON] ❌ Erro ao executar auto-cancelamento:', error);
        }
      }
    });

    job.start();
    console.log('[CRON] Job de auto-cancelamento iniciado (a cada 5 minutos)');
  }
}

export const appointmentAutoCancelService = new AppointmentAutoCancelService();