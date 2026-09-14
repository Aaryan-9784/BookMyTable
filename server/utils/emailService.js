import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import {
  generateBookingEmailTemplate,
  generateCancellationEmailTemplate,
  generateLoginOtpEmailTemplate,
  generateWelcomeEmailTemplate,
} from './emailTemplates.js';
import { createLogger } from './logger.js';

const logger = createLogger('Email');

const ADMIN_EMAIL = process.env.GMAIL_USER || 'aaryanpatel9784@gmail.com';

/**
 * Check if email service is properly configured
 */
function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY || process.env.GMAIL_APP_PASSWORD);
}

const getTransporter = () => {
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: ADMIN_EMAIL, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
};

/**
 * Send email helper — uses Resend API (HTTP) first, then falls back to Gmail SMTP
 */
async function sendMail({ to, subject, html, text }) {
  // 1. Try Resend API first (fastest and 100% reliable on cloud platforms like Render)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      let fromAddress = (process.env.RESEND_FROM_EMAIL || '').trim();
      if (!fromAddress || fromAddress.includes('yourdomain.com')) {
        fromAddress = 'BookMyTable <onboarding@resend.dev>';
      }
      
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
        text,
      });

      if (!error && data?.id) {
        logger.info('Email delivered successfully via Resend', { to, subject, messageId: data.id });
        return { ok: true, messageId: data.id, provider: 'resend' };
      }

      logger.warn('Resend delivery returned error, attempting Gmail SMTP fallback', { error: error?.message });
    } catch (resendErr) {
      logger.warn('Resend delivery exception, attempting Gmail SMTP fallback', { error: resendErr.message });
    }
  }

  // 2. Fallback to Gmail SMTP via Nodemailer
  const from = `BookMyTable <${ADMIN_EMAIL}>`;
  const transporter = getTransporter();

  if (!transporter) {
    const error = 'Email service not configured - neither RESEND_API_KEY nor GMAIL_APP_PASSWORD is set';
    logger.error(error, { to, subject });
    
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Development mode: Email not sent but operation continues', { to, subject });
      return { 
        ok: false, 
        devMode: true, 
        reason: error,
      };
    }
    
    return { ok: false, reason: error };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    logger.info('Email delivered successfully via Gmail SMTP', { to, subject, messageId: info.messageId });
    return { ok: true, messageId: info.messageId, provider: 'gmail' };
  } catch (err) {
    logger.error('Gmail SMTP delivery failed', { to, subject, error: err.message });
    return { ok: false, reason: err.message };
  }
}

/**
 * Send Booking Confirmation Email
 */
export async function sendBookingEmail({
  toEmail,
  restaurantName,
  date,
  time,
  guests,
  tableNumber,
  tableZone,
  tableCapacity,
  bookingId,
  paymentId,
  finalPayable,
  discountAmount,
  couponCode,
}) {
  const to = (toEmail || '').trim().toLowerCase();
  if (!to) return { ok: false, reason: 'Invalid recipient email' };

  const tableStr = tableNumber ? ` [Table ${tableNumber}${tableZone ? ` - ${tableZone}` : ''}]` : '';
  const subject = `BookMyTable — Reservation & Payment Receipt Confirmed: ${restaurantName}`;
  const text = `Reservation & Payment Confirmed at ${restaurantName}${tableStr} for ${date} at ${time} (${guests} guests). Total Paid: ₹${finalPayable || 0}. Payment Ref: ${paymentId || 'N/A'}`;
  const html = generateBookingEmailTemplate({
    restaurantName,
    date,
    time,
    guests,
    tableNumber,
    tableZone,
    tableCapacity,
    bookingId,
    paymentId,
    finalPayable,
    discountAmount,
    couponCode,
  });

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

  // Log OTP sending without exposing the actual code
  logger.info('Sending login OTP email', { to });

  const subject = `BookMyTable — Your Login Verification Code`;
  const text = `Your 6-digit BookMyTable Login Verification Code has been sent to your email.`;
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

