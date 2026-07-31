import nodemailer from 'nodemailer';
import {
  generateBookingEmailTemplate,
  generateCancellationEmailTemplate,
  generateLoginOtpEmailTemplate,
  generateWelcomeEmailTemplate,
} from './emailTemplates.js';

const getTransporter = () => {
  const user = process.env.GMAIL_USER || 'aaryanpatel9784@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

/**
 * Send email helper
 */
async function sendMail({ to, subject, html, text }) {
  const user = process.env.GMAIL_USER || 'aaryanpatel9784@gmail.com';
  const from = `BookMyTable <${user}>`;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[BookMyTable][Gmail Dev Log] To: ${to} | Subject: ${subject}`);
    return { ok: true, devMode: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log(`[BookMyTable][Gmail] Email delivered to ${to} (MessageId: ${info.messageId})`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error('[BookMyTable][Gmail Error]:', err.message);
    return { ok: false, reason: err.message };
  }
}

/**
 * Send Booking Confirmation Email
 */
export async function sendBookingEmail({ toEmail, restaurantName, date, time, guests }) {
  const to = (toEmail || '').trim().toLowerCase();
  if (!to) return { ok: false, reason: 'Invalid recipient email' };

  const subject = `BookMyTable — Reservation Confirmed: ${restaurantName}`;
  const text = `Reservation Confirmed at ${restaurantName} for ${date} at ${time} (${guests} guests).`;
  const html = generateBookingEmailTemplate({ restaurantName, date, time, guests });

  return await sendMail({ to, subject, text, html });
}

/**
 * Send Cancellation Email
 */
export async function sendCancellationEmail({ toEmail, restaurantName, date, time, guests }) {
  const to = (toEmail || '').trim().toLowerCase();
  if (!to) return { ok: false, reason: 'Invalid recipient email' };

  const subject = `BookMyTable — Reservation Cancelled: ${restaurantName}`;
  const text = `Your reservation at ${restaurantName} on ${date} at ${time} has been cancelled.`;
  const html = generateCancellationEmailTemplate({ restaurantName, date, time, guests });

  return await sendMail({ to, subject, text, html });
}

/**
 * Send 6-Digit Login OTP Email
 */
export async function sendLoginOtpEmail({ toEmail, otpCode }) {
  const to = (toEmail || '').trim().toLowerCase();
  if (!to) return { ok: false, reason: 'Invalid recipient email' };

  console.log(`\n======================================================`);
  console.log(`🔑 [BookMyTable OTP] Email: ${to} | OTP Code: ${otpCode}`);
  console.log(`======================================================\n`);

  const subject = `BookMyTable — Your Login Verification Code: ${otpCode}`;
  const text = `Your 6-digit BookMyTable Login Verification Code is: ${otpCode}`;
  const html = generateLoginOtpEmailTemplate({ otpCode });

  return await sendMail({ to, subject, text, html });
}

/**
 * Send Welcome Email
 */
export async function sendWelcomeEmail({ toEmail, fullName }) {
  const to = (toEmail || '').trim().toLowerCase();
  if (!to) return { ok: false, reason: 'Invalid recipient email' };

  const name = (fullName || '').trim() || 'Valued Guest';
  const subject = `Welcome to BookMyTable, ${name}! 🍽️`;
  const text = `Welcome to BookMyTable, ${name}! Explore luxury restaurants and reserve your table in seconds.`;
  const html = generateWelcomeEmailTemplate({ fullName: name });

  return await sendMail({ to, subject, text, html });
}

