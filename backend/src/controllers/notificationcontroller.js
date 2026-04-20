import * as notificationService from '../services/notificationservice.js';
import { sendResponse } from '../utils/apiResponse.js';

export const testEmail = async (req, res, next) => {
    try {
        const { to, subject, text, html } = req.body || {};
        const delivery = await notificationService.sendTestEmail({ to, subject, text, html });

        sendResponse(res, 200, true, delivery.mocked ? 'Test email payload logged in mock mode' : 'Test email sent successfully', {
            to,
            from: notificationService.getConfiguredEmailSender(),
            delivery: {
                provider: delivery.provider,
                mocked: delivery.mocked,
                delivered: delivery.delivered,
                externalId: delivery.externalId,
                reason: delivery.reason,
            },
        });
    } catch (error) {
        next(error);
    }
};
