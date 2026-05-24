import * as nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    // Skip if no SMTP credentials (safe fallback)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured. Email not sent.');
      return { success: false, message: 'SMTP not configured' };
    }

    const info = await transporter.sendMail({
      from: `"SmartStudy" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  return sendEmail({
    to,
    subject: 'Welcome to SmartStudy!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Welcome to SmartStudy, ${name}!</h1>
        <p>Thank you for joining SmartStudy. We're excited to help you achieve your academic goals.</p>
        <p>Get started by:</p>
        <ul>
          <li>Adding your subjects</li>
          <li>Creating your first study plan</li>
          <li>Trying our AI-powered study planner</li>
        </ul>
        <p>Best regards,<br>The SmartStudy Team</p>
      </div>
    `,
  });
};
