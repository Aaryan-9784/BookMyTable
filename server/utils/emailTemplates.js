/**
 * Unified Email Design System & Template Engine for BookMyTable.
 * Provides a standardized luxury header, content container, call-to-action (CTA),
 * and footer across all transactional emails.
 */

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Master Email Layout Wrapper
 * Ensures 100% visual consistency for header, body wrapper, and footer.
 */
export function renderEmailLayout({
  preheaderText = '',
  categoryBadge = 'LUXURY DINING RESERVATIONS',
  badgeColor = '#d4af37',
  title = '',
  titleColor = '#ffffff',
  messageHtml = '',
  detailsBoxHtml = '',
  ctaText = '',
  ctaUrl = '',
  recipientNoteHtml = '',
}) {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0c; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #ffffff;">
  ${preheaderText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${escapeHtml(preheaderText)}</div>` : ''}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0a0a0c; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #121218; border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);">
          
          <!-- Standard Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; background: linear-gradient(180deg, #181822 0%, #121218 100%);">
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; margin: 0 0 6px 0; color: #ffffff; letter-spacing: -0.5px;">
                Book<span style="color: #d4af37;">My</span>Table
              </h1>
              <p style="color: ${badgeColor}; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 700; margin: 0;">
                ${escapeHtml(categoryBadge)}
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 20px;">
                <tr>
                  <td style="border-top: 1px solid rgba(212, 175, 55, 0.25);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 10px 36px 32px 36px;">
              ${
                title
                  ? `<h2 style="font-family: Georgia, 'Times New Roman', serif; font-size: 23px; color: ${titleColor}; font-weight: normal; margin: 0 0 16px 0; text-align: center;">
                      ${escapeHtml(title)}
                    </h2>`
                  : ''
              }

              ${
                messageHtml
                  ? `<div style="font-size: 15px; color: #d0d0d5; line-height: 1.65; margin-bottom: 24px;">
                      ${messageHtml}
                    </div>`
                  : ''
              }

              ${detailsBoxHtml ? detailsBoxHtml : ''}

              ${
                ctaText && ctaUrl
                  ? `<div style="text-align: center; margin: 30px 0 10px 0;">
                      <a href="${escapeHtml(ctaUrl)}" style="display: inline-block; background: linear-gradient(135deg, #c9a84c 0%, #f0d060 50%, #c9a84c 100%); color: #0a0a0a; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);">
                        ${escapeHtml(ctaText)}
                      </a>
                    </div>`
                  : ''
              }

              ${
                recipientNoteHtml
                  ? `<div style="border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 24px; padding-top: 14px; font-size: 12px; color: #888894; text-align: center;">
                      ${recipientNoteHtml}
                    </div>`
                  : ''
              }
            </td>
          </tr>

          <!-- Standard Footer -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #0d0d12; border-top: 1px solid rgba(212, 175, 55, 0.15); text-align: center;">
              <p style="font-size: 12px; color: #d4af37; margin: 0 0 8px 0; font-weight: 600; letter-spacing: 0.5px;">
                Instant Confirmation • Curated Fine Dining • Guaranteed Seating
              </p>
              <p style="font-size: 12px; color: #777785; margin: 0 0 16px 0; line-height: 1.5;">
                Need help with your reservation? Contact us at 
                <a href="mailto:support@bookmytable.com" style="color: #d4af37; text-decoration: none;">support@bookmytable.com</a>
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 16px 0;">
                <tr>
                  <td style="border-top: 1px dashed rgba(255, 255, 255, 0.1);"></td>
                </tr>
              </table>
              <p style="font-size: 11px; color: #555563; margin: 0;">
                © ${currentYear} BookMyTable. Fine dining reserved in seconds.<br />
                This is an automated notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Booking Confirmation Email Template
 */
export function generateBookingEmailTemplate({
  restaurantName,
  date,
  time,
  guests,
  recipientNote = '',
  clientUrl = process.env.CLIENT_URL || 'http://localhost:5173',
}) {
  const messageHtml = `We are delighted to confirm your reservation at <strong>${escapeHtml(
    restaurantName
  )}</strong>. Your table is saved and ready for an exceptional dining experience.`;

  const detailsBoxHtml = `
    <div style="background-color: #07070a; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 22px; margin-bottom: 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #d4af37;">
            📍 <strong>Restaurant:</strong> <span style="color: #ffffff;">${escapeHtml(restaurantName)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #d4af37;">
            📅 <strong>Date:</strong> <span style="color: #ffffff;">${escapeHtml(date)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #d4af37;">
            ⏰ <strong>Time:</strong> <span style="color: #ffffff;">${escapeHtml(time)}</span>
          </td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #d4af37;">
            👥 <strong>Guests:</strong> <span style="color: #ffffff;">${guests} Person(s)</span>
          </td>
        </tr>
      </table>
    </div>
  `;

  return renderEmailLayout({
    preheaderText: `Reservation Confirmed at ${restaurantName} for ${date} at ${time}`,
    categoryBadge: 'Reservation Confirmed',
    badgeColor: '#4caf50',
    title: 'Your Table is Reserved! 🎉',
    titleColor: '#f5e27a',
    messageHtml,
    detailsBoxHtml,
    ctaText: 'View My Bookings',
    ctaUrl: `${clientUrl}/profile`,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}

/**
 * Booking Cancellation Email Template
 */
export function generateCancellationEmailTemplate({
  restaurantName,
  date,
  time,
  guests,
  recipientNote = '',
  clientUrl = process.env.CLIENT_URL || 'http://localhost:5173',
}) {
  const messageHtml = `Your reservation at <strong>${escapeHtml(
    restaurantName
  )}</strong> scheduled for <strong>${escapeHtml(date)}</strong> at <strong>${escapeHtml(
    time
  )}</strong> (${guests} guests) has been successfully cancelled.`;

  const detailsBoxHtml = `
    <div style="background-color: #07070a; border: 1px solid rgba(229, 115, 115, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #e57373;">
        Status: <strong>CANCELLED</strong>
      </p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #a0a0a5;">
        ${escapeHtml(restaurantName)} • ${escapeHtml(date)} • ${escapeHtml(time)}
      </p>
    </div>
  `;

  return renderEmailLayout({
    preheaderText: `Reservation Cancelled: ${restaurantName} on ${date}`,
    categoryBadge: 'Reservation Status',
    badgeColor: '#e57373',
    title: 'Reservation Cancelled',
    titleColor: '#e57373',
    messageHtml,
    detailsBoxHtml,
    ctaText: 'Explore Other Restaurants',
    ctaUrl: `${clientUrl}/restaurants`,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}

/**
 * Login OTP Security Verification Email Template
 */
export function generateLoginOtpEmailTemplate({ otpCode, recipientNote = '' }) {
  const messageHtml = `Use the following 6-digit verification code to complete your login to BookMyTable. For security, never share this code with anyone.`;

  const detailsBoxHtml = `
    <div style="background-color: #07070a; border: 1px solid rgba(212, 175, 55, 0.5); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #f5e27a; font-family: monospace;">
        ${escapeHtml(otpCode)}
      </div>
      <p style="font-size: 12px; color: #a0a0a5; margin: 10px 0 0 0;">
        ⏳ Valid for <strong>5 minutes</strong>
      </p>
    </div>
  `;

  return renderEmailLayout({
    preheaderText: `Your BookMyTable verification code is ${otpCode}`,
    categoryBadge: 'Security Verification',
    badgeColor: '#d4af37',
    title: 'Verification Code',
    titleColor: '#ffffff',
    messageHtml,
    detailsBoxHtml,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}

/**
 * Welcome Email Template
 */
export function generateWelcomeEmailTemplate({
  fullName,
  recipientNote = '',
  clientUrl = process.env.CLIENT_URL || 'http://localhost:5173',
}) {
  const name = (fullName || '').trim() || 'Valued Guest';

  const messageHtml = `We're thrilled to welcome you to BookMyTable, your gateway to handpicked fine dining experiences and instant table reservations.`;

  const detailsBoxHtml = `
    <div style="background-color: #07070a; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; padding: 22px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #d4af37; font-weight: 700;">✨ Here's what you can do with BookMyTable:</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 14px; color: #c0c0c8; line-height: 1.8;">
        <tr><td style="padding-bottom: 6px;">🥂 Discover top-rated luxury & gourmet restaurants</td></tr>
        <tr><td style="padding-bottom: 6px;">📅 Reserve tables in real-time with instant confirmation</td></tr>
        <tr><td style="padding-bottom: 6px;">⭐ Filter by cuisine type, location, and guest ratings</td></tr>
        <tr><td>📱 Manage all your upcoming reservations effortlessly</td></tr>
      </table>
    </div>
  `;

  return renderEmailLayout({
    preheaderText: `Welcome to BookMyTable, ${name}! Explore luxury dining.`,
    categoryBadge: 'Welcome to BookMyTable',
    badgeColor: '#d4af37',
    title: `Welcome, ${escapeHtml(name)}! 🎉`,
    titleColor: '#f5e27a',
    messageHtml,
    detailsBoxHtml,
    ctaText: 'Browse Luxury Restaurants',
    ctaUrl: `${clientUrl}/restaurants`,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}
