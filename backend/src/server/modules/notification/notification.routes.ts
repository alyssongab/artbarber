import type { Request, Response } from "express";
import { Router } from "express";
import { notificationServiceInstance } from "./notification.service.ts";

const notificationRouter = Router();

// Webhook to receive twilio messages
notificationRouter.post('/status-webhook', (req: Request, res: Response) => {
  try {
    if (!req.body) {
      console.log('⚠️ Body do webhook está vazio');
      return res.sendStatus(400);
    }

    const { 
      MessageSid, 
      MessageStatus, 
      From, 
      To, 
      ErrorCode, 
      ErrorMessage 
    } = req.body;
    
    if (ErrorCode) {
      console.log(`   Error Code: ${ErrorCode}`);
      console.log(`   Error Message: ${ErrorMessage}`);
    }

    // Verify nedeed data
    if (!MessageSid || !MessageStatus) {
      console.log('⚠️ Dados insuficientes no webhook');
      return res.sendStatus(400);
    }

    // Process status in the notification service
    if (notificationServiceInstance) {
      notificationServiceInstance.handleStatusWebhook(MessageSid, MessageStatus);
    } else {
      console.log('⚠️ NotificationService não inicializado');
    }

    res.sendStatus(200); // Confirm response to Twilio
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    console.error('Stack trace:', error.stack);
    res.sendStatus(500);
  }
});

// Webhook manual test
notificationRouter.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'Notification service is running',
    webhookUrl: `${process.env.API_URL}/api/notifications/status-webhook`,
    enabled: process.env.NOTIFICATIONS_ENABLED === 'true',
    apiUrl: process.env.API_URL
  });
});

// Webhook manual test
notificationRouter.post('/test-webhook', (req: Request, res: Response) => {
  console.log('🧪 Teste de webhook manual:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  if (notificationServiceInstance) {
    notificationServiceInstance.handleStatusWebhook('TEST123', 'delivered');
  }
  
  res.json({ message: 'Webhook testado com sucesso' });
});

export default notificationRouter;