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
    const now = new Date();
    
    // todays date (with no time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // current time minus 10min
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    // complete datetime (date + time)
    const fullDateTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      tenMinutesAgo.getHours(),
      tenMinutesAgo.getMinutes(),
      tenMinutesAgo.getSeconds()
    );

    console.log(`[AUTO-CANCEL] Verificando appointments pendentes até ${fullDateTime}...`);

    try {
      // find for todays appointments that are expired
      const expiredAppointments = await this.appointmentRepository.findExpiredPendingAppointments(
        today,
        fullDateTime
      );

      if (expiredAppointments.length === 0) {
        console.log('[AUTO-CANCEL] Nenhum agendamento expirado encontrado.');
        return { cancelled: 0, appointments: [] };
      }

      // Cancela todos os expirados
      const cancelledCount = await this.appointmentRepository.cancelExpiredAppointments(
        today,
        fullDateTime
      );

      console.log(`[AUTO-CANCEL] ✅ ${cancelledCount} agendamentos cancelados por não comparecimento.`);

      // notify clients
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
    console.log('[CRON] ✅ Job de auto-cancelamento iniciado (a cada 5 minutos)');
  }
}

export const appointmentAutoCancelService = new AppointmentAutoCancelService();