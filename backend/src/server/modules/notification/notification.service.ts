import twilio from 'twilio';
import { AppointmentRepository } from '../appointments/appointments.repository.ts';
import { UserRepository } from '../users/user.repository.ts';
import { ServiceRepository } from '../services/services.repository.ts';
import type { Appointment, Service, User } from '../../../generated/prisma/client.ts';
import { AppointmentWithRelations } from '../appointments/appointment.types.ts';

const TIMEZONE = 'America/Manaus';

export class NotificationService {
  private twilioClient: twilio.Twilio;
  private twilioWhatsappNumber: string;
  private appointmentRepository: AppointmentRepository;
  private serviceRepository: ServiceRepository;
  private userRepository: UserRepository;
  
  // store scheduled timeouts
  private scheduledTimeouts: Map<number, NodeJS.Timeout> = new Map();
  // messageSid -> appointmentId
  private messageToAppointment: Map<string, number> = new Map();

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.serviceRepository = new ServiceRepository();
    this.userRepository = new UserRepository();

    // Twilio config
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER!;

    if (!accountSid || !authToken || !this.twilioWhatsappNumber) {
      throw new Error('Credenciais Twilio não configuradas');
    }

    this.twilioClient = twilio(accountSid, authToken);
  
    this.loadPendingNotifications();
  }

  /**
   * load all pending notifs when server starts
   */
  private async loadPendingNotifications() {
    if (process.env.NOTIFICATIONS_ENABLED !== 'true') {
      console.log('⚠️ Notifications disabled');
      return;
    }

    try {
      const now = new Date();
      const futureAppointments = await this.appointmentRepository.findPendingNotifications(now);

      console.log(`📅 Carregando ${futureAppointments.length} notificações pendentes`);

      for (const appointment of futureAppointments) {
        if (appointment.scheduled_notification_time) {
          this.scheduleNotification(
            appointment.appointment_id,
            appointment.scheduled_notification_time
          );
        }
      }

      console.log(`✅ ${this.scheduledTimeouts.size} notificações agendadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações pendentes:', error);
    }
  }

  /**
   * schedule a notification to a specific time
   * 
   * @param appointmentId 
   * @param scheduledTime time to be sent (15 min before appointment)
   */
  public scheduleNotification(appointmentId: number, scheduledTime: Date) {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    // if time to notify is past, it sends immediately
    if (delay <= 0) {
      console.log(`⚡ Notificação atrasada (${appointmentId}), enviando imediatamente`);
      this.sendNotificationById(appointmentId);
      return;
    }

    // cancel previous appointment if exists
    if (this.scheduledTimeouts.has(appointmentId)) {
      clearTimeout(this.scheduledTimeouts.get(appointmentId)!);
    }

    // new timeout
    const timeout = setTimeout(async () => {
      await this.sendNotificationById(appointmentId);
      this.scheduledTimeouts.delete(appointmentId);
    }, delay);

    this.scheduledTimeouts.set(appointmentId, timeout);

    console.log(`⏰ Notificação agendada: Appointment ${appointmentId} em ${scheduledTime.toLocaleString('pt-BR', { timeZone: TIMEZONE })}`);
  }

  /**
   * cancel a scheduled notif.
   */
  public cancelScheduledNotification(appointmentId: number) {
    const timeout = this.scheduledTimeouts.get(appointmentId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledTimeouts.delete(appointmentId);
      console.log(`🚫 Notificação cancelada: Appointment ${appointmentId}`);
    }
  }

  /**
   * find appointment and send notif.
   */
  private async sendNotificationById(appointmentId: number) {
    try {
      const appointment = await this.appointmentRepository.findById(appointmentId);
      
      if (!appointment) {
        console.log(`⚠️ Appointment ${appointmentId} não encontrado`);
        return;
      }

      // validatoins
      if (appointment.notification_sent) {
        console.log(`⚠️ Notificação já enviada para appointment ${appointmentId}`);
        return;
      }

      if (appointment.appointment_status !== 'PENDENTE') {
        console.log(`⚠️ Appointment ${appointmentId} não está pendente`);
        return;
      }

      if (!appointment.client || !appointment.service || !appointment.barber) {
        console.log(`⚠️ Appointment ${appointmentId} sem dados completos`);
        return;
      }

      await this.sendAppointmentReminder(appointment);

    } catch (error) {
      console.error(`❌ Erro ao enviar notificação ${appointmentId}:`, error);
    }
  }

  /**
   * send notification via whatsapp
   * automatic retry if fails
   */
  private async sendAppointmentReminder(appointment: AppointmentWithRelations, retryCount = 0): Promise<void> {
    const MAX_RETRIES = 3;

    try {
      const { client, service, barber } = appointment;

      if (!client?.phone_number) {
        console.log(`⚠️ Cliente sem telefone`);
        await this.appointmentRepository.updateNotificationStatus(appointment.appointment_id, true);
        return;
      }

      const phoneNumber = this.formatPhoneNumber(client.phone_number);
      const webhookUrl = `${process.env.API_URL}/notifications/status-webhook`;
      const templateVariables = this.prepareTemplateVariables(appointment, client, service, barber);

      console.log(`📤 Enviando notificação: ${client.full_name} - Appointment ${appointment.appointment_id}`);

      const messageResponse = await this.twilioClient.messages.create({
        from: `whatsapp:${this.twilioWhatsappNumber}`,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_TEMPLATE_SID!,
        contentVariables: JSON.stringify(templateVariables),
        statusCallback: webhookUrl
      });

      this.messageToAppointment.set(messageResponse.sid, appointment.appointment_id);
      console.log(`📤 Mensagem criada: ${messageResponse.sid} - Status: ${messageResponse.status}`);


    } catch (error: any) {
      // Sandbox error - no retry
      if (error.code === 63015) {
        console.log(`⚠️ SANDBOX: Número não autorizado`);
        await this.appointmentRepository.updateNotificationStatus(appointment.appointment_id, true);
        return;
      }

      // exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`⚠️ Retry ${retryCount + 1}/${MAX_RETRIES} em ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendAppointmentReminder(appointment, retryCount + 1);
      }

      console.error(`❌ Falha após ${MAX_RETRIES} tentativas:`, error);
    }
  }

  private prepareTemplateVariables(appointment: Appointment, client: User, service: Service, barber: User) {
    const appointmentDateTime = appointment.appointment_datetime;

    const date = appointmentDateTime.toLocaleDateString('pt-BR', {
      timeZone: TIMEZONE
    });

    const time = appointmentDateTime.toLocaleTimeString('pt-BR', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      1: "ArtBarber",
      2: client.full_name,
      3: date,
      4: time,
      5: service.name,
      6: barber.full_name,
      7: service.price.toFixed(2)
    };
  }

  public async handleStatusWebhook(
    messageSid: string, 
    messageStatus: string, 
    errorCode?: string, 
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const timestamp = new Date().toLocaleString('pt-BR', { timeZone: TIMEZONE });
      
      const appointmentId = this.messageToAppointment.get(messageSid);

      if(!appointmentId){
        console.log(`⚠️ [${timestamp}] Webhook: ${messageSid} - ${messageStatus} (sem appointment associado)`);
        return true; // ignore twilio response looping
      }

      console.log(`📡 [${timestamp}] Webhook: ${messageSid} - ${messageStatus} (Appointment ${appointmentId})`);
      
      if (errorCode) {
        console.log(`   ❌ Error: ${errorCode} - ${errorMessage}`);
      }

      // update status based on twilio response
      if (messageStatus === 'delivered') {
        await this.appointmentRepository.updateNotificationStatus(appointmentId, true);
        console.log(`   ✅ Notificação CONFIRMADA para appointment ${appointmentId}`);
        this.messageToAppointment.delete(messageSid);
      }

      if (messageStatus === 'failed' || messageStatus === 'undelivered') {
        console.log(`   ❌ Notificação FALHOU para appointment ${appointmentId}`);
        this.messageToAppointment.delete(messageSid);
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      return false;
    }
  }
  
  /**
   * Remove the 9 prefix (brazilian format)
   * @param phoneNumber number in br format (912345678)
   * @returns twilio format (12345678)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.length < 10 || cleanNumber.length > 11) {
      throw new Error(`Telefone inválido: ${phoneNumber}`);
    }
    
    if (cleanNumber.length === 11) {
      const areaCode = cleanNumber.substring(0, 2);
      const number = cleanNumber.substring(3);
      return `+55${areaCode}${number}`;
    }
    
    return `+55${cleanNumber}`;
  }
}

export let notificationServiceInstance: NotificationService;

export function initializeNotificationService() {
  notificationServiceInstance = new NotificationService();
  return notificationServiceInstance;
}