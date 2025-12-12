import twilio from 'twilio';
import { CronJob } from 'cron';
import { AppointmentRepository } from '../appointments/appointments.repository.ts';
import { UserRepository } from '../users/user.repository.ts';
import { ServiceRepository } from '../services/services.repository.ts';
import type { Appointment, Service, User } from '../../../generated/prisma/client.ts';

export class NotificationService {

  private twilioClient: twilio.Twilio;
  private twilioWhatsappNumber: string;
  private appointmentRepository: AppointmentRepository;
  private serviceRepository: ServiceRepository;
  private userRepository: UserRepository;
  private messageSidMap: Map<string, { appointmentId: number, clientName: string }> = new Map();

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.serviceRepository = new ServiceRepository();
    this.userRepository = new UserRepository();

    // twilio config
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    this.twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER!;

    this.twilioClient = twilio(accountSid, authToken);
    this.setupCronJob();
  }

  /**
   * Cron job to automatic execution
   * Runs every 15 sec
   */
  private setupCronJob() {
    if(process.env.NOTIFICATIONS_ENABLED === 'true') {
      const job = CronJob.from({
        // runs every 30sec
        cronTime: '*/20 * * * * *',
        onTick: async () => await this.checkUpcomingAppointments()
      });

      job.start();
      console.log("========== Notification service started (every 15s) ==========");
    }
  }

  /**
   * Check appointments to be notified
   * Process:
   * 1. Find all appointments for the current day
   * 2. Filter those in the gap of 15min (+- 15s)
   * 3. Send notification to the filtered clients
   * 
   * Runs automatically through cron job every 15 seconds
   * @throws {Error} if fails either to find appointments or send notifications
   */
  private async checkUpcomingAppointments(){
      try {
          const now = new Date();

          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);

          console.log(`📅 Buscando agendamentos do dia: ${startOfDay.toLocaleDateString('pt-BR')}`);

          const allTodayAppointments = await this.appointmentRepository.findByDateRange(startOfDay, endOfDay);

          console.log(`📋 Total de agendamentos do dia (não notificados): ${allTodayAppointments.length}`);

          const appointmentsToNotify = this.filterAppointmentsForNotification(allTodayAppointments, now);

          console.log(`📨 Agendamentos a serem notificados (dentro de 15min): ${appointmentsToNotify.length}`);
          console.log("-".repeat(50))


          for (const appointment of appointmentsToNotify) {
              await this.sendAppointmentReminder(appointment);
          }

      } catch (error) {
          console.error('❌ Erro ao verificar agendamentos:', error);
      }
  }

  /**
   * Fiter appointments that are inside the notification window
   * Rule: notify appointments that will be in exactly 15min (+- 15 sec tolerancy)
   * 
   * @param appointments Appointments of the day
   * @param currentTime Current time to calculate
   * @returns Appointments array that need to be notified
   */
  private filterAppointmentsForNotification(appointments: Appointment[], currentTime: Date): Appointment[] {
    return appointments.filter(appointment => {
      const appointmentDateTime = this.combineDateTime(appointment.appointment_date, appointment.appointment_time);

      // calculate the difference in minutes
      const timeDifference = appointmentDateTime.getTime() - currentTime.getTime();
      const minutesDifference = timeDifference / (60 * 1000) // convert into minutes

      // Log for debugging
      console.log(`📋 Agendamento ID ${appointment.appointment_id}:`);
      console.log(`   Data/Hora: ${appointmentDateTime.toLocaleString('pt-BR')}`);
      console.log(`   Diferença: ${minutesDifference.toFixed(2)} minutos`);

      const isInNotificationWindow = minutesDifference >= 14.5 && minutesDifference <= 15.5;

      if (isInNotificationWindow) {
        console.log(`✅ Agendamento ${appointment.appointment_id} está na janela de notificação`);
      } else {
        console.log(`⏭️ Agendamento ${appointment.appointment_id} fora da janela (${minutesDifference.toFixed(2)}min)`);
      }

      return isInNotificationWindow;  
    });
  }

  /**
   * Combines date and time into a unique DateTime
   * 
   * Prisma stores:
   * - appointment_date: date (YYYY-MM-DD)
   * - appointment_time: time (HH:MM:SS)
   * 
   * @param appointmentDate Appointment date
   * @param appointmentTime Appointment time
   * @returns Full Appointment DateTime
   */
  private combineDateTime(appointmentDate: Date, appointmentTime: Date): Date {

    // Extract only the date and time as strings
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const timeStr = appointmentTime.toISOString().split('T')[1]!.substring(0, 8); 
    
    // Combine strings and generates a new one
    const combinedStr = `${dateStr}T${timeStr}Z`;
    const combined = new Date(combinedStr);
    
    // console.log(`   combinedStr: ${combinedStr}`);
    // console.log(`   combined result: ${combined.toISOString()}`);
    // console.log(`   combined local: ${combined.toLocaleString('pt-BR')}`);

    return combined;
  }

  /**
   * Sends a appointment reminder via Whatsapp
   * 
   * Process:
   * 1. Find client, service and barber
   * 2. Validates if data is complete
   * 3. Calculate exact time difference
   * 4. Prepare template variables
   * 5. Send via Twilio Whatsapp API
   * 6. Registers MessageSid for tracking
   * 7. Marks notification as sent
   * 
   * @param appointment Appointment to receive notification
   * @throws {Error} If there is missing data or fails in sending process
   */
  private async sendAppointmentReminder(appointment: Appointment) {
    try{
      const client = await this.userRepository.findById(appointment.id_client!);
      const service = await this.serviceRepository.findById(appointment.id_service);
      const barber = await this.userRepository.findById(appointment.id_barber);
      
      if(!client?.phone_number || !service || !barber) {
        console.log("Dados incompletos para enviar notificação");
        return;
      }

      const now = new Date();
      const appointmentDateTime = this.combineDateTime(appointment.appointment_date, appointment.appointment_time);
      const exactDifference = Math.round((appointmentDateTime.getTime() - now.getTime()) / (60 * 1000));

      const phoneNumber = this.formatPhoneNumber(client.phone_number);
      const webhookUrl = `${process.env.API_URL}/notifications/status-webhook`;

      console.log(`📤 ENVIANDO NOTIFICAÇÃO:`);
      console.log(`   Cliente: ${client.full_name} (${client.phone_number})`);
      console.log(`   Agendamento: ${appointmentDateTime.toLocaleString('pt-BR')}`);
      console.log(`   Diferença exata: ${exactDifference} minutos`);

      const templateVariables = this.prepareTemplateVariables(appointment, client, service, barber);

      const messageResponse = await this.twilioClient.messages.create({
        from: `whatsapp:${this.twilioWhatsappNumber}`,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_TEMPLATE_SID!,
        contentVariables: JSON.stringify(templateVariables),
        statusCallback: webhookUrl
      });

      this.messageSidMap.set(messageResponse.sid, {
        appointmentId: appointment.appointment_id,
        clientName: client.full_name
      });

      await this.appointmentRepository.updateNotificationStatus(appointment.appointment_id, true);

      console.log(`✅ Mensagem enviada com ${exactDifference}min de antecedência! MessageSid: ${messageResponse.sid}`);

    }
    catch(error: any){
      console.log(`❌ Erro code: ${error.code}`);
      
      // If sandbox error, it does not try to send again and mark is as sent
      if (error.code === 63015) {
        console.log(`⚠️ SANDBOX: Número não autorizado - marcando como enviado`);
        await this.appointmentRepository.updateNotificationStatus(appointment.appointment_id, true);
      }
      
      console.error("❌ Erro ao enviar lembrete:", error);
    }
  }

  /**
   * Prepare variables to whatsapp template
   * 
   * Converts appointment data into numbered variables
   * that will be replaced in the approved template by whatsapp
   * 
   * @param appointment 
   * @param client 
   * @param service 
   * @param barber 
   * @returns Object with numbered variables to the template
   */
  private prepareTemplateVariables(appointment: Appointment, client: User, service: Service, barber: User){

    const date = new Date(appointment.appointment_date).toLocaleDateString('pt-BR', {
      timeZone: 'UTC'
    });

    const time = new Date(appointment.appointment_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // console.log(`date: ${date}`);
    // console.log(`time: ${time}`);

    return {
      1: "ArtBarber",           // Barbershop's name
      2: client.full_name,     // Client name
      3: date,                  // Appointment date
      4: time,                  // Appointment time
      5: service.name,          // Service name
      6: barber.full_name,     // Barber name
      7: service.price.toFixed(2)  // Service price
    };
  }

  /**
   * Process Twilio status message webhook
   * 
   * Receives status updates and shows detailed logs about delivery state
   * Centralizes ALL webhook logging
   * 
   * @param messageSid - Twilio's message unique ID
   * @param messageStatus - Current status (sent, delivered, read, failed, etc)
   * @param errorCode - Error code if any
   * @param errorMessage - Error message if any
   */
  public handleStatusWebhook(messageSid: string, messageStatus: string, errorCode?: string, errorMessage?: string) {
    const timestamp = new Date().toLocaleString('pt-BR');
    const statusEmoji = this.getStatusEmoji(messageStatus);
    
    console.log(`📡 [${timestamp}] Webhook Twilio recebido:`);
    console.log(`   MessageSid: ${messageSid}`);
    console.log(`   Status: ${messageStatus.toUpperCase()}`);
    
    if (errorCode) {
      console.log(`   ❌ Error Code: ${errorCode}`);
      console.log(`   ❌ Error Message: ${errorMessage || 'N/A'}`);
    }

    const messageInfo = this.messageSidMap.get(messageSid);
    
    if (messageInfo) {
      console.log(`${statusEmoji} Status Update para agendamento:`);
      console.log(`   Cliente: ${messageInfo.clientName}`);
      console.log(`   Agendamento ID: ${messageInfo.appointmentId}`);
      console.log(`   Descrição: ${this.getStatusDescription(messageStatus)}`);
      
      if (['delivered', 'failed', 'undelivered', 'read'].includes(messageStatus)) {
        console.log(`🗑️ Removendo ${messageSid} do tracking (status final)`);
        this.messageSidMap.delete(messageSid);
      }
    } else {
      console.log(`⚠️ MessageSid não encontrado no tracking - pode ser de envio anterior`);
    }
    
    console.log('─'.repeat(50));
  }

  /**
   * Maps Twilio status to visual emojis on logs
   * 
   * @param status Message status (queued, sent, delivered, etc)
   * @returns Status corresponding emoji
   */
  private getStatusEmoji(status: string): string {
    const statusEmojis: { [key: string]: string } = {
      'queued': '⏳',
      'sent': '📤',
      'delivered': '✅',
      'read': '👁️',
      'failed': '❌',
      'undelivered': '❌'
    };
    return statusEmojis[status] || '📋';
  }

  /**
   * Converts Twilioo techincal status into
   * friendly descriptions to the logs 
   * 
   * @param status Technical status message
   * @returns Portuguese description of the status
   */
  private getStatusDescription(status: string): string {
    const descriptions: { [key: string]: string } = {
      'queued': 'Mensagem na fila para envio',
      'sent': 'Mensagem enviada para o WhatsApp',
      'delivered': 'Mensagem entregue ao destinatário',
      'read': 'Mensagem lida pelo destinatário',
      'failed': 'Falha no envio da mensagem',
      'undelivered': 'Mensagem não entregue'
    };
    return descriptions[status] || 'Status desconhecido';
  }


  /**
   * Converts brazilian phone number (from database) into
   * international format accepted by Twilio
   * @param phoneNumber Phone number in format "92912345678" (11 digits)
   * @returns Formatted number "+559212345678" (without the extra 9)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // 11 digits in the format "92912345678"
    // Removes the extra '9': "92912345678" -> "9212345678"
    const areaCode = cleanNumber.substring(0, 2);    // "92"
    const number = cleanNumber.substring(3);         // "12345678" (skips 9)
    
    return `+55${areaCode}${number}`;               // "+559212345678"
  }
  
}

export let notificationServiceInstance: NotificationService;

export function initializeNotificationService() {
  notificationServiceInstance = new NotificationService();
  return notificationServiceInstance;
}
