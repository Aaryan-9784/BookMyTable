/**
 * Gmail SMTP Email Service — Delivers emails directly to ALL users globally via Nodemailer.
 */
import nodemailer from 'nodemailer';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0a0a0c; color: #ffffff; padding: 24px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #121218; border: 1px solid rgba(212,175,55,0.35); border-radius: 16px; padding: 36px; text-align: center;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; margin-bottom: 6px; color: #ffffff;">
            Book<span style="color: #d4af37;">My</span>Table
          </h1>
          <p style="color: #d4af37; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-top: 0;">
            Reservation Confirmation
          </p>
          <hr style="border: none; border-top: 1px solid rgba(212,175,55,0.2); margin: 24px 0;" />
          
          <h2 style="font-family: Georgia, serif; font-size: 22px; color: #f5e27a; font-weight: normal; margin-bottom: 16px;">
            Your Table is Reserved! 🎉
          </h2>

          <p style="font-size: 15px; color: #d0d0d0; line-height: 1.6; margin-bottom: 24px; text-align: left;">
            We are pleased to confirm your reservation at <strong>${escapeHtml(restaurantName)}</strong>.
          </p>

          <div style="background-color: #07070a; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 28px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #d4af37;">📍 <strong>Restaurant:</strong> ${escapeHtml(restaurantName)}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">📅 <strong>Date:</strong> ${escapeHtml(date)}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">⏰ <strong>Time:</strong> ${escapeHtml(time)}</p>
            <p style="margin: 0; font-size: 14px; color: #ffffff;">👥 <strong>Guests:</strong> ${guests} Person(s)</p>
          </div>

          <p style="font-size: 12px; color: #666666; margin-top: 24px; margin-bottom: 0;">
            © ${new Date().getFullYear()} BookMyTable. Fine dining reserved in seconds.
          </p>
        </div>
      </body>
    </html>
  `;

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

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0a0a0c; color: #ffffff; padding: 24px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #121218; border: 1px solid rgba(212,175,55,0.35); border-radius: 16px; padding: 36px; text-align: center;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; margin-bottom: 6px; color: #ffffff;">
            Book<span style="color: #d4af37;">My</span>Table
          </h1>
          <p style="color: #d4af37; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-top: 0;">
            Reservation Cancelled
          </p>
          <hr style="border: none; border-top: 1px solid rgba(212,175,55,0.2); margin: 24px 0;" />
          
          <h2 style="font-family: Georgia, serif; font-size: 22px; color: #e57373; font-weight: normal; margin-bottom: 16px;">
            Reservation Cancelled
          </h2>

          <p style="font-size: 15px; color: #d0d0d0; line-height: 1.6; margin-bottom: 24px; text-align: left;">
            Your table reservation at <strong>${escapeHtml(restaurantName)}</strong> on <strong>${escapeHtml(date)}</strong> at <strong>${escapeHtml(time)}</strong> has been cancelled.
          </p>

          <p style="font-size: 12px; color: #666666; margin-top: 24px; margin-bottom: 0;">
            © ${new Date().getFullYear()} BookMyTable. Fine dining reserved in seconds.
          </p>
        </div>
      </body>
    </html>
  `;

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

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0a0a0c; color: #ffffff; padding: 24px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #121218; border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 32px; text-align: center;">
          <h1 style="font-family: Georgia, serif; font-size: 24px; margin-bottom: 8px; color: #ffffff;">
            Book<span style="color: #d4af37;">My</span>Table
          </h1>
          <p style="color: #d4af37; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-top: 0;">
            Security Verification
          </p>
          <hr style="border: none; border-top: 1px solid rgba(212,175,55,0.2); margin: 20px 0;" />
          <p style="font-size: 14px; color: #d0d0d0; margin-bottom: 24px;">
            Use the following 6-digit verification code to complete your sign in:
          </p>
          <div style="background-color: #07070a; border: 1px solid rgba(212,175,55,0.5); padding: 16px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f5e27a; margin-bottom: 24px;">
            ${escapeHtml(otpCode)}
          </div>
          <p style="font-size: 12px; color: #888888;">
            This code will expire in 5 minutes. If you did not request this login code, please secure your account immediately.
          </p>
        </div>
      </body>
    </html>
  `;

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

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0a0a0c; color: #ffffff; padding: 24px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #121218; border: 1px solid rgba(212,175,55,0.35); border-radius: 16px; padding: 36px; text-align: center;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; margin-bottom: 6px; color: #ffffff;">
            Book<span style="color: #d4af37;">My</span>Table
          </h1>
          <p style="color: #d4af37; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-top: 0;">
            Luxury Restaurant Reservations
          </p>
          <hr style="border: none; border-top: 1px solid rgba(212,175,55,0.2); margin: 24px 0;" />
          
          <h2 style="font-family: Georgia, serif; font-size: 22px; color: #f5e27a; font-weight: normal; margin-bottom: 16px;">
            Welcome to BookMyTable, ${escapeHtml(name)}! 🎉
          </h2>

          <p style="font-size: 15px; color: #d0d0d0; line-height: 1.6; margin-bottom: 24px; text-align: left;">
            We're thrilled to have you join our exclusive community of fine dining enthusiasts. With BookMyTable, you can discover curated luxury restaurants, pick your ideal time slot, and reserve your table seamlessly.
          </p>

          <div style="background-color: #07070a; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 28px;">
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #d4af37; font-weight: bold;">✨ What you can do next:</p>
            <ul style="margin: 0; padding-left: 20px; color: #b0b0b0; font-size: 14px; line-height: 1.8;">
              <li>Explore top-rated luxury restaurants</li>
              <li>Filter by cuisine, price range, and guest ratings</li>
              <li>Instant table reservation with instant confirmation</li>
              <li>Manage your upcoming bookings anytime</li>
            </ul>
          </div>

          <p style="font-size: 12px; color: #666666; margin-top: 24px; margin-bottom: 0;">
            © ${new Date().getFullYear()} BookMyTable. Fine dining reserved in seconds.
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendMail({ to, subject, text, html });
}
