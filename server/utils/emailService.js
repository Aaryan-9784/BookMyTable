import nodemailer from 'nodemailer';
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
  const pass = process.env.GMAIL_APP_PASSWORD;
  return Boolean(pass && pass.length > 0);
}

const getTransporter = () => {
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: ADMIN_EMAIL, pass },
  });
};

/**
 * Send email helper — always sends from the admin email
 */
async function sendMail({ to, subject, html, text }) {
  const from = `BookMyTable <${ADMIN_EMAIL}>`;

  const transporter = getTransporter();

  if (!transporter) {
    const error = 'Email service not configured - GMAIL_APP_PASSWORD not set';
    logger.error(error, { to, subject });
    
    // In development, log but don't fail
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Development mode: Email not sent but operation continues', { to, subject });
      return { 
        ok: false, 
        devMode: true, 
        reason: error,
        message: 'Email service not configured - set GMAIL_APP_PASSWORD or RESEND_API_KEY in .env'
      };
    }
    
    // In production, this is a critical failure
    throw new Error(error);
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    logger.info('Email delivered successfully', { to, subject, messageId: info.messageId });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Email delivery failed', { to, subject, error: err.message });
    
    // In production, throw the error so it can be handled appropriately
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Email delivery failed: ${err.message}`);
    }
    
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

