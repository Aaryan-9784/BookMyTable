/**
 * Re-export all email dispatcher functions from emailService.js (Gmail SMTP Gateway).
 */
export {
  sendBookingEmail,
  sendCancellationEmail,
  sendLoginOtpEmail,
  sendWelcomeEmail,
} from './emailService.js';
