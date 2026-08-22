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

export const contactMessage = async (req, res, next) => {
    try {
        const { name, email, phone, projectType, message } = req.body || {};
        
        if (!name || !email || !message) {
            return sendResponse(res, 400, false, 'Name, email and message are required.');
        }

        const subject = `New Contact Form Submission: ${projectType || 'General Inquiry'}`;
        const text = `
New message from Green Electric Website:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Project Type: ${projectType || 'Not specified'}

Message:
${message}
        `;
        
        const html = `
<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
  <h2 style="color: #4F46E5;">New message from Green Electric Website</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
  <p><strong>Project Type:</strong> ${projectType || 'Not specified'}</p>
  <br/>
  <p><strong>Message:</strong></p>
  <p>${message.replace(/\n/g, '<br/>')}</p>
</div>
        `;

        const to = notificationService.getConfiguredEmailSender() || 'office@green-electric.ro';
        const delivery = await notificationService.sendTestEmail({ to, subject, text, html });

        sendResponse(res, 200, true, 'Mesajul dumneavoastra a fost trimis cu succes.', {
            delivered: delivery.delivered
        });
    } catch (error) {
        next(error);
    }
};
