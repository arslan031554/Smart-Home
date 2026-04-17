import 'dotenv/config';
import app from './app.js';
import sequelize from './config/database.js';
import '../models/index.js'; // Initialize models and associations
import { initFollowupCron } from './services/followupservice.js';
import { DataTypes } from 'sequelize';
import { getRecaptchaDiagnostics } from './security/recaptcha.js';
import { getNotificationIntegrationStatus } from './services/notificationservice.js';

const REQUIRED_ENV = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
    const requiredProductionEnv = ['FRONTEND_URL', 'CORS_ORIGIN'];
    const missingProduction = requiredProductionEnv.filter((key) => !process.env[key]);
    if (missingProduction.length > 0) {
        console.error(`FATAL: Missing production environment variables: ${missingProduction.join(', ')}`);
        process.exit(1);
    }

    const recaptcha = getRecaptchaDiagnostics();
    const notifications = getNotificationIntegrationStatus();
    const issues = [];

    if (!recaptcha.productionReady) {
        issues.push('reCAPTCHA is not production-ready.');
    }
    if (notifications.email.mode !== 'live') {
        issues.push(`Email integration is not production-ready: ${notifications.email.reason || notifications.email.mode}`);
    }
    if (notifications.sms.mode !== 'live') {
        issues.push(`SMS integration is not production-ready: ${notifications.sms.reason || notifications.sms.mode}`);
    }

    if (issues.length > 0) {
        console.error('FATAL: Integration validation failed:');
        issues.forEach((issue) => console.error(`- ${issue}`));
        process.exit(1);
    }
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Lightweight DB patching for local/dev: ensure ProductRanges.priceMultiplier exists
        try {
            const qi = sequelize.getQueryInterface();
            const table = await qi.describeTable('ProductRanges');
            if (!table.priceMultiplier) {
                await qi.addColumn('ProductRanges', 'priceMultiplier', {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                    defaultValue: 1.0
                });
                console.log('DB patched: added ProductRanges.priceMultiplier');
            }
        } catch (e) {
            console.warn('DB patch skipped (priceMultiplier):', e?.message || e);
        }

        // Initialize Cron Jobs
        initFollowupCron();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
