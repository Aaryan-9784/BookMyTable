/**
 * Amazon SES (AWS SDK v3) — booking confirmation mail.
 *
 * Env:
 *   SES_FROM_EMAIL or SES_EMAIL — verified sender (required)
 *   AWS_REGION / SES_REGION — must match SES console region
 *   SES_SANDBOX_* — see .env.example
 *
 * Flow: createBooking → sendBookingEmail → SendEmailCommand → CloudWatch / inbox
 */
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../config/awsClients.js';

const LOG = '[BookMyTable][SES]';

/** Resolved sender: SES_FROM_EMAIL takes precedence over SES_EMAIL (alias). */
export function getVerifiedSenderAddress() {
  const from = (process.env.SES_FROM_EMAIL || process.env.SES_EMAIL || '').trim();
  return from || null;
}

/**
 * Call once at server startup to surface misconfiguration in logs (not a hard fail).
 */
export function logSesEnvironmentStatus() {
  const region = process.env.AWS_REGION || 'us-east-1';
  const sesRegion = process.env.SES_REGION || region;
  const from = getVerifiedSenderAddress();
  const hasKeys = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

  console.log(`${LOG} Environment check:`);
  console.log(`${LOG}   AWS_REGION=${region} SES_REGION=${sesRegion}`);
  console.log(`${LOG}   Credentials (env keys present): ${hasKeys}`);
  console.log(`${LOG}   Sender (SES_FROM_EMAIL or SES_EMAIL): ${from || '(MISSING — emails will not send)'}`);
  console.log(`${LOG}   SES_SANDBOX_FALLBACK_TO_SENDER=${process.env.SES_SANDBOX_FALLBACK_TO_SENDER || 'not set'}`);
  console.log(`${LOG}   SES_SEND_CONFIRMATIONS_TO_SENDER_ONLY=${process.env.SES_SEND_CONFIRMATIONS_TO_SENDER_ONLY || 'not set'}`);
  if (!from) {
    console.warn(`${LOG} Set SES_FROM_EMAIL (or SES_EMAIL) to a verified SES identity in region ${sesRegion}.`);
  }
}

function extractEmail(from) {
  const s = String(from || '').trim();
  const m = s.match(/<([^>]+)>/);
  return (m ? m[1] : s).toLowerCase().trim();
}

function envFlag(name) {
  return ['true', '1', 'yes'].includes(String(process.env[name] || '').toLowerCase());
}

function buildSandboxHint(awsMessage, senderEmail, to) {
  const region = process.env.AWS_REGION || 'us-east-1';
  const extracted = awsMessage.match(/[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/g) || [];
  const emails = [...new Set([senderEmail, to, ...extracted].map((e) => String(e).toLowerCase()))].filter(
    Boolean
  );

  return [
    `Region ${region}: AWS Console → Amazon SES → Verified identities → Create identity → Email.`,
    `Confirm each link AWS sends you for: ${emails.join(', ')}.`,
    `Sender (SES_FROM_EMAIL): ${senderEmail}. Recipient (customer): ${to}.`,
    senderEmail === to
      ? 'Same address for both — verify it once in SES.'
      : 'Different addresses — verify BOTH in sandbox, or request SES production access.',
    'Production: SES → Account dashboard → Request production access (then no per-email verify).',
  ].join(' ');
}

function buildBodies({ restaurantName, date, time, guests, to, destination, deliveryNote }) {
  const extra =
    destination !== to || deliveryNote === 'sender_only' || deliveryNote === 'fallback'
      ? [
          '',
          '---',
          `Customer / login email: ${to}`,
          deliveryNote === 'fallback'
            ? '(SES sandbox: original recipient is not verified — this copy was sent to your verified sender inbox.)'
            : deliveryNote === 'sender_only'
              ? '(SES_SEND_CONFIRMATIONS_TO_SENDER_ONLY: all confirmations go to the verified sender address.)'
              : '(SES sandbox redirect: intended recipient is shown above.)',
        ]
      : [];

  const textBody = [
    'Your table reservation is confirmed.',
    '',
    `Restaurant: ${restaurantName}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Guests: ${guests}`,
    ...extra,
    '',
    'Thank you for using BookMyTable.',
  ].join('\n');

  const showCustomer =
    destination !== to || deliveryNote === 'sender_only' || deliveryNote === 'fallback';

  const htmlBody = `
    <html><body style="font-family:Georgia,serif;color:#0f0f0f;">
      <h2 style="color:#d4af37;">Booking confirmed</h2>
      <p>Your table reservation at <strong>${escapeHtml(restaurantName)}</strong> is saved.</p>
      <ul>
        <li><strong>Date:</strong> ${escapeHtml(date)}</li>
        <li><strong>Time:</strong> ${escapeHtml(time)}</li>
        <li><strong>Guests:</strong> ${guests}</li>
      </ul>
      ${
        showCustomer
          ? `<p style="border-top:1px solid #ccc;padding-top:12px;margin-top:16px;font-size:13px;color:#444;">
          <strong>Customer email:</strong> ${escapeHtml(to)}
        </p>`
          : ''
      }
      <p>Thank you for using BookMyTable.</p>
    </body></html>
  `;

  return { textBody, htmlBody };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Sends booking confirmation via SES v3 SendEmail.
 *
 * @returns {Promise<{ ok: boolean, reason?: string, hint?: string, sandboxRedirect?: boolean, intendedRecipient?: string, deliveredTo?: string, messageId?: string }>}
 */
export async function sendBookingEmail({ toEmail, restaurantName, date, time, guests }) {
  const fromAddressRaw = getVerifiedSenderAddress();
  if (!fromAddressRaw) {
    console.warn(`${LOG} ABORT: no SES_FROM_EMAIL or SES_EMAIL in environment`);
    return {
      ok: false,
      reason: 'SES_FROM_EMAIL (or SES_EMAIL) is not set on the server',
      hint: 'Add a verified sender address to server/.env',
    };
  }

  const to = (toEmail || '').trim().toLowerCase();
  console.log(`${LOG} sendBookingEmail start | to=${to} | restaurant=${restaurantName}`);

  if (!to || !to.includes('@')) {
    console.error(`${LOG} ABORT: invalid recipient email from user record`);
    return { ok: false, reason: 'User has no valid email on file (check Cognito ID token includes email).' };
  }
  if (to.endsWith('@cognito.local')) {
    console.error(`${LOG} ABORT: placeholder email (cognito.local)`);
    return {
      ok: false,
      reason: 'Placeholder email only — Cognito did not supply a real email in the ID token.',
      hint: 'In Cognito App client, ensure openid/email scopes; ID token must include the email claim.',
    };
  }

  const senderEmail = extractEmail(fromAddressRaw);
  const subject = `BookMyTable — Booking confirmed at ${restaurantName}`;

  const redirectTo = (process.env.SES_SANDBOX_REDIRECT_TO || '').trim().toLowerCase();
  const sendToSenderOnly = envFlag('SES_SEND_CONFIRMATIONS_TO_SENDER_ONLY');

  let destination = to;
  let deliveryNote = '';

  if (sendToSenderOnly) {
    destination = senderEmail;
    deliveryNote = 'sender_only';
    console.log(`${LOG} Mode: SES_SEND_CONFIRMATIONS_TO_SENDER_ONLY → destination=${destination}`);
  } else if (redirectTo) {
    destination = redirectTo;
    deliveryNote = redirectTo !== to ? 'redirect' : '';
    console.log(`${LOG} Mode: SES_SANDBOX_REDIRECT_TO → destination=${destination}`);
  } else {
    console.log(`${LOG} Mode: direct to customer → destination=${destination} (sandbox: must be verified)`);
  }

  const { textBody, htmlBody } = buildBodies({
    restaurantName,
    date,
    time,
    guests,
    to,
    destination,
    deliveryNote,
  });

  const trySend = async (dest, text, html) => {
    const cmd = new SendEmailCommand({
      Source: fromAddressRaw,
      Destination: { ToAddresses: [dest] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: text, Charset: 'UTF-8' },
          Html: { Data: html, Charset: 'UTF-8' },
        },
      },
    });
    console.log(`${LOG} SendEmailCommand | Source=${fromAddressRaw} | To=${dest} | Region=${process.env.SES_REGION || process.env.AWS_REGION || 'us-east-1'}`);
    const out = await sesClient.send(cmd);
    return out;
  };

  try {
    const result = await trySend(destination, textBody, htmlBody);
    const messageId = result?.MessageId || '(none)';
    const redirected = destination !== to;
    console.log(
      `${LOG} SUCCESS MessageId=${messageId} deliveredTo=${destination}${redirected ? ` intendedRecipient=${to}` : ''}`
    );
    return {
      ok: true,
      messageId,
      ...(redirected && {
        sandboxRedirect: true,
        intendedRecipient: to,
        deliveredTo: destination,
      }),
    };
  } catch (err) {
    const msg = err.message || String(err);
    const code = err.name || err.Code || err.$metadata?.httpStatusCode || 'unknown';
    console.error(`${LOG} SendEmail FAILED code=${code} message=${msg}`);
    if (err.$response?.body) {
      console.error(`${LOG} Raw error detail (if any):`, err.$response?.body);
    }

    const canFallback =
      envFlag('SES_SANDBOX_FALLBACK_TO_SENDER') &&
      !sendToSenderOnly &&
      !redirectTo &&
      destination === to &&
      senderEmail &&
      senderEmail !== to &&
      /not verified|failed the check|MessageRejected/i.test(msg);

    if (canFallback) {
      console.log(`${LOG} Attempting sandbox fallback: resend to verified sender ${senderEmail}`);
      try {
        const fb = buildBodies({
          restaurantName,
          date,
          time,
          guests,
          to,
          destination: senderEmail,
          deliveryNote: 'fallback',
        });
        const result2 = await trySend(senderEmail, fb.textBody, fb.htmlBody);
        const mid = result2?.MessageId || '(none)';
        console.log(`${LOG} FALLBACK SUCCESS MessageId=${mid} deliveredTo=${senderEmail} intendedRecipient=${to}`);
        return {
          ok: true,
          messageId: mid,
          sandboxRedirect: true,
          intendedRecipient: to,
          deliveredTo: senderEmail,
        };
      } catch (err2) {
        const m2 = err2.message || String(err2);
        console.error(`${LOG} FALLBACK FAILED: ${m2}`);
        const hint2 = buildSandboxHint(`${msg} ${m2}`, senderEmail, to);
        return { ok: false, reason: m2 || msg, hint: hint2 };
      }
    }

    if (senderEmail === to) {
      console.warn(`${LOG} Fallback skipped (sender === recipient). Verify this identity in SES sandbox.`);
    }

    const sandboxHint = /not verified|sandbox|MessageRejected|Email address is not verified/i.test(msg)
      ? buildSandboxHint(msg, senderEmail, to)
      : 'Check IAM permissions (ses:SendEmail, ses:SendRawEmail), region (SES_REGION / AWS_REGION), and verified SES_FROM_EMAIL.';

    return { ok: false, reason: msg, hint: sandboxHint };
  }
}

/**
 * Cancellation notice — same SES rules as confirmation (sandbox / verified identities).
 */
export async function sendCancellationEmail({ toEmail, restaurantName, date, time, guests }) {
  const fromAddressRaw = getVerifiedSenderAddress();
  if (!fromAddressRaw) {
    console.warn(`${LOG} sendCancellationEmail: no sender configured`);
    return { ok: false, reason: 'SES sender not configured' };
  }

  const to = (toEmail || '').trim().toLowerCase();
  if (!to || to.endsWith('@cognito.local')) {
    return { ok: false, reason: 'Invalid recipient' };
  }

  const subject = `BookMyTable — Booking cancelled: ${restaurantName}`;
  const textBody = [
    'Your table reservation has been cancelled.',
    '',
    `Restaurant: ${restaurantName}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Guests: ${guests}`,
    '',
    'Thank you for using BookMyTable.',
  ].join('\n');

  const htmlBody = `
    <html><body style="font-family:Georgia,serif;color:#0f0f0f;">
      <h2 style="color:#b8860b;">Booking cancelled</h2>
      <p>Your reservation at <strong>${escapeHtml(restaurantName)}</strong> was cancelled.</p>
      <ul>
        <li><strong>Date:</strong> ${escapeHtml(date)}</li>
        <li><strong>Time:</strong> ${escapeHtml(time)}</li>
        <li><strong>Guests:</strong> ${guests}</li>
      </ul>
    </body></html>
  `;

  try {
    const cmd = new SendEmailCommand({
      Source: fromAddressRaw,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: textBody, Charset: 'UTF-8' },
          Html: { Data: htmlBody, Charset: 'UTF-8' },
        },
      },
    });
    console.log(`${LOG} sendCancellationEmail → To=${to}`);
    const out = await sesClient.send(cmd);
    console.log(`${LOG} cancellation sent MessageId=${out.MessageId || 'n/a'}`);
    return { ok: true, messageId: out.MessageId };
  } catch (err) {
    console.error(`${LOG} sendCancellationEmail failed:`, err.message);
    return { ok: false, reason: err.message };
  }
}
