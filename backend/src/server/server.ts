import 'dotenv/config';
import app from "./shared/http/app.ts";
import { initializeNotificationService } from "./modules/notification/notification.service.ts";
import { appointmentAutoCancelService } from './modules/appointments/appointment-cron.service.ts';

const PORT = process.env.PORT ? Number(process.env.PORT_BACKEND) : 3030;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`servidor on na porta ${PORT}`);
    if (process.env.NOTIFICATIONS_ENABLED === 'true') {
        initializeNotificationService();
        appointmentAutoCancelService.startCronJob();
    }
});