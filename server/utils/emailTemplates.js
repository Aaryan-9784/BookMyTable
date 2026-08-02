/**
 * Unified Email Design System & Template Engine for BookMyTable.
 * Premium luxury dark-theme transactional emails with consistent
 * header, body, and footer across all email types.
 *
 * Admin / Support Email: aaryanpatel9784@gmail.com
 */

const ADMIN_EMAIL = 'aaryanpatel9784@gmail.com';
const BRAND_GOLD = '#d4af37';
const BRAND_GOLD_LIGHT = '#f5e27a';
const BRAND_BG = '#0a0a0c';
const CARD_BG = '#111118';
const CARD_INNER = '#0c0c12';

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Master Email Layout Wrapper — Premium Luxury Design
 */
export function renderEmailLayout({
  preheaderText = '',
  categoryBadge = 'LUXURY DINING RESERVATIONS',
  badgeColor = BRAND_GOLD,
  title = '',
  titleColor = '#ffffff',
  greetingName = '',
  messageHtml = '',
  detailsBoxHtml = '',
  ctaText = '',
  ctaUrl = '',
  recipientNoteHtml = '',
}) {
  const currentYear = new Date().getFullYear();
  const greeting = greetingName
    ? `<p style="font-size: 15px; color: #c8c8d0; margin: 0 0 14px 0;">Dear <strong style="color: #ffffff;">${escapeHtml(greetingName)}</strong>,</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title || 'BookMyTable')}</title>
  <!--[if mso]>
  <style>body,table,td{font-family:Arial,Helvetica,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND_BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#ffffff;width:100%;">
  ${preheaderText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheaderText)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND_BG};padding:32px 12px;">
    <tr>
      <td align="center">

        <!-- ═══════════ MAIN CONTAINER ═══════════ -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:${CARD_BG};border-radius:20px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.65),0 0 0 1px rgba(212,175,55,0.18);">

          <!-- ▬▬▬ TOP GOLD ACCENT ▬▬▬ -->
          <tr><td style="height:4px;background:linear-gradient(90deg,#997819 0%,#d4af37 25%,#f5e27a 50%,#d4af37 75%,#997819 100%);"></td></tr>

          <!-- ▬▬▬ HEADER ▬▬▬ -->
          <tr>
            <td style="padding:36px 40px 24px 40px;text-align:center;background:linear-gradient(180deg,#16161e 0%,${CARD_BG} 100%);">
              <!-- Brand Name -->
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;margin:0 0 4px 0;color:#ffffff;letter-spacing:-0.3px;font-weight:400;">
                Book<span style="color:${BRAND_GOLD};font-weight:700;">My</span>Table
              </h1>
              <!-- Category Badge -->
              <div style="display:inline-block;margin-top:8px;padding:5px 16px;border-radius:20px;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);">
                <span style="color:${badgeColor};font-size:10px;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;">
                  ${escapeHtml(categoryBadge)}
                </span>
              </div>
              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(212,175,55,0.3) 50%,transparent 100%);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ▬▬▬ BODY ▬▬▬ -->
          <tr>
            <td style="padding:8px 40px 36px 40px;">

              ${title ? `
              <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${titleColor};font-weight:400;margin:12px 0 20px 0;text-align:center;line-height:1.35;">
                ${escapeHtml(title)}
              </h2>` : ''}

              ${greeting}

              ${messageHtml ? `
              <div style="font-size:15px;color:#b8b8c0;line-height:1.7;margin-bottom:24px;">
                ${messageHtml}
              </div>` : ''}

              ${detailsBoxHtml || ''}

              ${ctaText && ctaUrl ? `
              <div style="text-align:center;margin:32px 0 12px 0;">
                <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#c9a84c 0%,#f0d060 50%,#c9a84c 100%);color:#0a0a0a;text-decoration:none;font-weight:700;font-size:13px;padding:14px 36px;border-radius:30px;text-transform:uppercase;letter-spacing:1.2px;box-shadow:0 6px 24px rgba(212,175,55,0.3);mso-padding-alt:0;">
                  ${escapeHtml(ctaText)}
                </a>
              </div>` : ''}

              ${recipientNoteHtml ? `
              <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:28px;padding-top:14px;font-size:12px;color:#777780;text-align:center;line-height:1.5;">
                ${recipientNoteHtml}
              </div>` : ''}

            </td>
          </tr>

          <!-- ▬▬▬ FOOTER ▬▬▬ -->
          <tr>
            <td style="padding:0;">
              <!-- Footer Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr><td style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(212,175,55,0.25) 50%,transparent 100%);"></td></tr>
              </table>

              <div style="padding:24px 40px 22px 40px;background:linear-gradient(180deg,${CARD_BG} 0%,#0d0d14 100%);text-align:center;">

                <!-- Contact -->
                <p style="font-size:12px;color:#666672;margin:0 0 4px 0;line-height:1.5;">
                  Questions? Reach us at
                </p>
                <a href="mailto:${ADMIN_EMAIL}" style="color:${BRAND_GOLD};text-decoration:none;font-size:13px;font-weight:600;">${ADMIN_EMAIL}</a>

                <!-- Divider -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:14px 0;">
                  <tr><td style="border-top:1px dashed rgba(255,255,255,0.06);"></td></tr>
                </table>

                <!-- Copyright -->
                <p style="font-size:11px;color:#444452;margin:0;line-height:1.55;">
                  © ${currentYear} BookMyTable. All rights reserved.<br>
                  This is an automated message. Please do not reply.
                </p>
              </div>
            </td>
          </tr>

          <!-- ▬▬▬ BOTTOM GOLD ACCENT ▬▬▬ -->
          <tr><td style="height:4px;background:linear-gradient(90deg,#997819 0%,#d4af37 25%,#f5e27a 50%,#d4af37 75%,#997819 100%);"></td></tr>

        </table>
        <!-- /MAIN CONTAINER -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════
 * DETAIL ROW HELPER  — renders a single icon + label + value row
 * ═══════════════════════════════════════════════════════════════ */
function detailRow(icon, label, value, valueStyle = '') {
  return `
  <tr>
    <td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.04);">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="width:28px;font-size:16px;vertical-align:middle;">${icon}</td>
          <td style="font-size:13px;color:#888890;vertical-align:middle;padding-right:8px;">${escapeHtml(label)}</td>
          <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;vertical-align:middle;${valueStyle}">${value}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/* ═══════════════════════════════════════════════════════════════
 * 1. BOOKING CONFIRMATION
 * ═══════════════════════════════════════════════════════════════ */
export function generateBookingEmailTemplate({
  restaurantName,
  date,
  time,
  guests,
  tableNumber = '',
  tableZone = '',
  tableCapacity = null,
  bookingId = '',
  paymentId = '',
  finalPayable = 0,
  discountAmount = 0,
  couponCode = '',
  recipientNote = '',
  clientUrl = process.env.CLIENT_URL || 'http://localhost:5173',
}) {
  const tableText = tableNumber
    ? `Table ${escapeHtml(tableNumber)}${tableZone ? ` (${escapeHtml(tableZone)})` : ''}`
    : null;

  const messageHtml = `
    Your reservation at <strong style="color:#ffffff;">${escapeHtml(restaurantName)}</strong> has been confirmed and your deposit payment was processed successfully.
    <span style="display:block;margin-top:6px;font-size:13px;color:#888890;">Please arrive 10 minutes before your reservation time.</span>`;

  const detailsBoxHtml = `
    <div style="background:${CARD_INNER};border:1px solid rgba(212,175,55,0.22);border-radius:14px;overflow:hidden;margin-bottom:24px;">
      <!-- Box Header -->
      <div style="padding:14px 16px;background:linear-gradient(90deg,rgba(212,175,55,0.08) 0%,transparent 100%);border-bottom:1px solid rgba(212,175,55,0.12);">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${BRAND_GOLD};">Reservation Details</span>
      </div>
      <!-- Rows -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${detailRow('📍', 'Restaurant', escapeHtml(restaurantName))}
        ${detailRow('📅', 'Date', escapeHtml(date))}
        ${detailRow('⏰', 'Time', escapeHtml(time))}
        ${detailRow('👥', 'Guests', `${guests} Guest(s)`)}
        ${tableText ? detailRow('🪑', 'Assigned Table', `<strong style="color:${BRAND_GOLD};">${tableText}</strong>`) : ''}
        ${paymentId ? detailRow('💳', 'Payment Ref', `<span style="font-family:monospace;color:#4ade80;font-size:12px;">${escapeHtml(paymentId)}</span>`, '') : ''}
        ${detailRow('💰', 'Amount Paid', `<span style="color:${BRAND_GOLD_LIGHT};font-size:16px;">₹${finalPayable}</span>${discountAmount > 0 ? `<br><span style="font-size:11px;color:#4ade80;font-weight:400;">Saved ₹${discountAmount} with ${escapeHtml(couponCode)}</span>` : ''}`, '')}
      </table>
    </div>`;

  return renderEmailLayout({
    preheaderText: `Reservation Confirmed at ${restaurantName} for ${date} at ${time}`,
    categoryBadge: 'Reservation Confirmed',
    badgeColor: '#4ade80',
    title: 'Your Table is Reserved! 🎉',
    titleColor: BRAND_GOLD_LIGHT,
    messageHtml,
    detailsBoxHtml,
    ctaText: 'View My Bookings',
    ctaUrl: `${clientUrl}/my-bookings`,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}

/* ═══════════════════════════════════════════════════════════════
 * 2. BOOKING CANCELLATION
 * ═══════════════════════════════════════════════════════════════ */
export function generateCancellationEmailTemplate({
  restaurantName,
  date,
  time,
  guests,
  recipientNote = '',
  clientUrl = process.env.CLIENT_URL || 'http://localhost:5173',
}) {
  const messageHtml = `
    Your reservation at <strong style="color:#ffffff;">${escapeHtml(restaurantName)}</strong> scheduled for
    <strong style="color:#ffffff;">${escapeHtml(date)}</strong> at
    <strong style="color:#ffffff;">${escapeHtml(time)}</strong>
    (${guests} guest${guests > 1 ? 's' : ''}) has been cancelled.`;

  const detailsBoxHtml = `
    <div style="background:${CARD_INNER};border:1px solid rgba(248,113,113,0.25);border-radius:14px;overflow:hidden;margin-bottom:24px;">
      <!-- Status Banner -->
      <div style="padding:18px 16px;text-align:center;background:linear-gradient(90deg,rgba(248,113,113,0.06) 0%,transparent 100%);border-bottom:1px solid rgba(248,113,113,0.12);">
        <div style="display:inline-block;padding:4px 14px;border-radius:20px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.25);">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#f87171;">✕ Cancelled</span>
        </div>
      </div>
      <!-- Summary -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${detailRow('📍', 'Restaurant', escapeHtml(restaurantName))}
        ${detailRow('📅', 'Date', escapeHtml(date))}
        ${detailRow('⏰', 'Time', escapeHtml(time))}
        ${detailRow('👥', 'Guests', `${guests} Guest(s)`)}
      </table>
    </div>
    <p style="font-size:13px;color:#888890;text-align:center;margin:0 0 8px 0;">
      We'd love to host you again — explore other available restaurants below.
    </p>`;

  return renderEmailLayout({
    preheaderText: `Reservation Cancelled: ${restaurantName} on ${date}`,
    categoryBadge: 'Reservation Update',
    badgeColor: '#f87171',
    title: 'Reservation Cancelled',
    titleColor: '#f87171',
    messageHtml,
    detailsBoxHtml,
    ctaText: 'Explore Other Restaurants',
    ctaUrl: `${clientUrl}/restaurants`,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}

/* ═══════════════════════════════════════════════════════════════
 * 3. LOGIN OTP VERIFICATION
 * ═══════════════════════════════════════════════════════════════ */
export function generateLoginOtpEmailTemplate({ otpCode, recipientNote = '' }) {
  const messageHtml = `Use the verification code below to complete your login. For your security, <strong style="color:#ffffff;">never share this code</strong> with anyone.`;

  const digits = String(otpCode).split('');
  const digitBoxes = digits.map(d =>
    `<td style="width:44px;height:52px;background:${CARD_INNER};border:1px solid rgba(212,175,55,0.35);border-radius:10px;text-align:center;font-size:26px;font-weight:700;color:${BRAND_GOLD_LIGHT};font-family:'Courier New',monospace;letter-spacing:0;box-shadow:0 4px 12px rgba(0,0,0,0.3);">${d}</td>`
  ).join('<td style="width:8px;"></td>');

  const detailsBoxHtml = `
    <div style="background:${CARD_INNER};border:1px solid rgba(212,175,55,0.25);border-radius:14px;padding:28px 20px;text-align:center;margin-bottom:24px;">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:2.5px;color:${BRAND_GOLD};font-weight:700;margin:0 0 18px 0;">Your Verification Code</p>
      <!-- OTP Digit Boxes -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
        <tr>${digitBoxes}</tr>
      </table>
      <!-- Timer -->
      <div style="margin-top:18px;display:inline-block;padding:5px 14px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
        <span style="font-size:12px;color:#888890;">⏳ Valid for <strong style="color:#ffffff;">5 minutes</strong></span>
      </div>
    </div>
    <p style="font-size:12px;color:#666672;text-align:center;margin:0;">
      If you didn't request this code, you can safely ignore this email.
    </p>`;

  return renderEmailLayout({
    preheaderText: `Your BookMyTable verification code: ${otpCode}`,
    categoryBadge: 'Security Verification',
    badgeColor: BRAND_GOLD,
    title: 'Login Verification 🔐',
    titleColor: '#ffffff',
    messageHtml,
    detailsBoxHtml,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}

/* ═══════════════════════════════════════════════════════════════
 * 4. WELCOME EMAIL
 * ═══════════════════════════════════════════════════════════════ */
export function generateWelcomeEmailTemplate({
  fullName,
  recipientNote = '',
  clientUrl = process.env.CLIENT_URL || 'http://localhost:5173',
}) {
  const name = (fullName || '').trim() || 'Valued Guest';

  const messageHtml = `We're thrilled to have you join BookMyTable — your personal gateway to curated fine dining experiences and instant table reservations across premium restaurants.`;

  const featureRow = (emoji, text) =>
    `<tr>
      <td style="width:32px;font-size:16px;vertical-align:top;padding:6px 0;">${emoji}</td>
      <td style="font-size:13px;color:#b0b0b8;line-height:1.6;padding:6px 0;">${text}</td>
    </tr>`;

  const detailsBoxHtml = `
    <!-- Welcome Coupon -->
    <div style="background:${CARD_INNER};border:1px solid rgba(212,175,55,0.3);border-radius:14px;overflow:hidden;margin-bottom:20px;">
      <div style="padding:16px 20px;background:linear-gradient(90deg,rgba(212,175,55,0.08) 0%,transparent 100%);border-bottom:1px solid rgba(212,175,55,0.12);text-align:center;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${BRAND_GOLD};">🎁 Exclusive Welcome Gift</span>
      </div>
      <div style="padding:24px 20px;text-align:center;">
        <p style="margin:0 0 6px 0;font-size:18px;color:#ffffff;font-family:Georgia,serif;font-weight:400;">Get <strong style="color:${BRAND_GOLD_LIGHT};">₹100 OFF</strong> Your First Reservation</p>
        <div style="display:inline-block;margin:14px 0;background:rgba(212,175,55,0.1);border:2px dashed ${BRAND_GOLD};border-radius:10px;padding:12px 28px;">
          <span style="font-size:24px;font-weight:700;color:${BRAND_GOLD_LIGHT};letter-spacing:6px;font-family:'Courier New',monospace;">WELCOME100</span>
        </div>
        <p style="margin:8px 0 0 0;font-size:12px;color:#888890;">Apply at checkout to claim your discount</p>
      </div>
    </div>

    <!-- Features -->
    <div style="background:${CARD_INNER};border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px 20px 14px 20px;margin-bottom:24px;">
      <p style="margin:0 0 12px 0;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${BRAND_GOLD};font-weight:700;">What you can do</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${featureRow('🥂', 'Discover top-rated luxury & gourmet restaurants')}
        ${featureRow('📅', 'Reserve tables instantly with real-time confirmation')}
        ${featureRow('⭐', 'Filter by cuisine, location, ratings & price tier')}
        ${featureRow('📱', 'Manage all your reservations from one dashboard')}
      </table>
    </div>`;

  return renderEmailLayout({
    preheaderText: `Welcome to BookMyTable, ${name}! Your ₹100 welcome code: WELCOME100`,
    categoryBadge: 'Welcome Aboard',
    badgeColor: BRAND_GOLD,
    title: `Welcome, ${escapeHtml(name)}! 🎉`,
    titleColor: BRAND_GOLD_LIGHT,
    greetingName: name,
    messageHtml,
    detailsBoxHtml,
    ctaText: 'Start Exploring Restaurants',
    ctaUrl: `${clientUrl}/restaurants`,
    recipientNoteHtml: recipientNote ? escapeHtml(recipientNote) : '',
  });
}
