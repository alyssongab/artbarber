import app from "./shared/http/app.ts";
import { initializeNotificationService } from "./modules/notification/notification.service.ts";

const PORT = process.env.PORT_BACKEND;

app.listen(PORT, () => {
    console.log(`servidor on na porta ${PORT}`);
    if (process.env.NOTIFICATIONS_ENABLED === 'true') {
        initializeNotificationService();
    }
});