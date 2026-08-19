/**
 * FILE: api/quote.js
 *
 * PURPOSE:
 *   Vercel serverless function that handles all quote / enquiry form submissions
 *   from the website. Called via POST /api/quote from the contact and product pages.
 *
 * WHAT IT DOES:
 *   When a user submits a quote request form, this function sends TWO emails:
 *
 *   1. Company notification email → sent to GMAIL_USER (the Siechem sales inbox).
 *      Contains: customer name, phone, company, email, part number, cable type,
 *      quantity, delivery requirement, and any notes. Plain table layout so sales
 *      can read it quickly on mobile.
 *
 *   2. Customer acknowledgement email → sent to the customer's own email address.
 *      Contains: a generated reference number (SC-XXXXXX), a summary of what they
 *      requested, full product specification table (if the form passed cable_spec
 *      JSON — e.g. from the automotive product page which auto-fills spec data),
 *      and a "what happens next" section explaining the 4-hour response SLA.
 *
 * WHY SERVERLESS (not a contact form service):
 *   - The customer email includes dynamic product spec data (size tables, temp
 *     ratings, insulation type) pulled from the page's JS — a generic form service
 *     like Formspree can't render those as a formatted HTML table.
 *   - Vercel serverless gives us full Node.js so we can use nodemailer to build
 *     the HTML email ourselves with complete layout control.
 *   - No external form service subscription needed; cost is zero on Vercel's free tier.
 *
 * ENVIRONMENT VARIABLES (set in Vercel project dashboard):
 *
 *   Preferred — any SMTP mailbox (e.g. Siechem's own cPanel mail server):
 *     SMTP_HOST   — outgoing mail server, e.g. mail.siechem.com
 *     SMTP_PORT   — 465 for SSL (default), or 587 for STARTTLS
 *     SMTP_USER   — full mailbox address, e.g. sales@siechem.com
 *     SMTP_PASS   — that mailbox's password
 *     SALES_EMAIL — optional; where enquiries are delivered. Defaults to SMTP_USER.
 *
 *   Legacy fallback — Gmail. Used only when SMTP_HOST is not set:
 *     GMAIL_USER  — sender Gmail address
 *     GMAIL_PASS  — 16-character Gmail App Password (not the account password)
 *                   Generate at: myaccount.google.com → Security → App Passwords
 *
 *   Note: App Passwords are a Gmail-specific concept. A normal cPanel or
 *   Exchange mailbox just uses its own password — there is nothing to generate.
 *
 * ERROR HANDLING:
 *   - Each email send is wrapped in try/catch independently.
 *   - If BOTH emails fail → returns HTTP 500 with error details.
 *   - If only ONE fails (e.g. customer email bounced) → returns HTTP 200 with a
 *     `warnings` array so the UI still shows "success" to the customer but the
 *     partial failure is logged.
 *
 * REFERENCE NUMBER FORMAT:
 *   "SC-" + last 6 chars of Date.now().toString(36).toUpperCase()
 *   e.g. SC-1Z4FPQ — base-36 is used so the ref is short enough to read over
 *   the phone but still unique within the same millisecond window.
 */
// Vercel serverless function — POST /api/quote
// Sends two emails via SMTP (nodemailer):
//   1. Company notification  → the sales inbox
//   2. Customer spec sheet   → customer's email
// See the ENVIRONMENT VARIABLES block above for configuration.

const nodemailer = require('nodemailer');

/**
 * Resolves the outgoing mail settings.
 *
 * Defaults to Gmail so the existing GMAIL_USER / GMAIL_PASS setup keeps working
 * untouched. Setting SMTP_HOST switches to any other mail server — Siechem's own
 * cPanel mailbox, for instance — with no code change.
 */
function mailConfig() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || '').trim();
  // Where enquiries land. Defaults to the sending mailbox, which is the common case.
  const salesInbox = (process.env.SALES_EMAIL || user).trim();
  // Port 465 is implicit TLS; 587 upgrades via STARTTLS after connecting.
  return { host, port, secure: port === 465, user, pass, salesInbox };
}

// Every field below comes straight from the public POST body with no
// server-side validation, and gets interpolated into HTML emails sent to
// Siechem's real sales inbox (and back to the submitter). Unescaped, an
// attacker could inject arbitrary HTML/links into a notification that looks
// like a legitimate internal email -- escape before every interpolation.
function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Company notification email (plain summary) ─────────────────────────────
function companyEmailHtml({ name, phone, company, email, part_number, cable_type, quantity, delivery, message }) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#e31e24;margin:0 0 16px;">New Quote Request — Siechem Automotive Cables</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:160px;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${esc(name) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${esc(phone) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Company</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${esc(company) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${esc(email)}">${esc(email) || '—'}</a></td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Part Number</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${esc(part_number) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Cable Type</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${esc(cable_type) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Quantity</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${esc(quantity) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Delivery</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${esc(delivery) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;vertical-align:top;">Notes</td><td style="padding:8px 12px;">${esc(message) || '—'}</td></tr>
  </table>
  <p style="margin-top:20px;font-size:12px;color:#9ca3af;">Submitted via siechem.vercel.app</p>
</body></html>`;
}

// ─── Customer spec sheet email ──────────────────────────────────────────────
function buildSpecEmail({ name, part_number, quantity, delivery, message, cable_spec }) {
  const ref = 'SC-' + Date.now().toString(36).toUpperCase().slice(-6);
  const spec = (() => {
    if (!cable_spec) return {};
    if (typeof cable_spec === 'string') { try { return JSON.parse(cable_spec); } catch(e) { return {}; } }
    return cable_spec;
  })();

  const sizesRows = (spec.allSizes || []).map(s => `
    <tr>
      <td style="padding:8px 14px;font-family:monospace;font-size:13px;border-bottom:1px solid #e5e7eb;">${esc(s.size)} ${esc(spec.unit) || 'mm²'}</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${esc(s.amps)} A</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${esc(s.ohm)} mΩ/m</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${esc(s.od_mm)} mm</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${esc(s.weight)} kg/km</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${esc(s.stdLen)} m</td>
    </tr>`).join('');

  const sizesTable = sizesRows ? `
    <h3 style="margin:28px 0 12px;font-size:15px;color:#111827;">Complete Size Range</h3>
    <div style="overflow-x:auto;border-radius:8px;border:1px solid #e5e7eb;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:9px 14px;text-align:left;font-weight:600;">Size</th>
            <th style="padding:9px 14px;font-weight:600;">Current</th>
            <th style="padding:9px 14px;font-weight:600;">Resistance</th>
            <th style="padding:9px 14px;font-weight:600;">O.D.</th>
            <th style="padding:9px 14px;font-weight:600;">Weight</th>
            <th style="padding:9px 14px;font-weight:600;">Std. Length</th>
          </tr>
        </thead>
        <tbody>${sizesRows}</tbody>
      </table>
    </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

  <tr>
    <td style="background:linear-gradient(135deg,#0f0f14 0%,#1a0a0b 100%);padding:28px 40px;">
      <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Siechem</span>
      <span style="color:rgba(255,255,255,0.4);margin:0 10px;">|</span>
      <span style="color:rgba(255,255,255,0.55);font-size:13px;">Progress Through Research</span>
    </td>
  </tr>

  <tr><td style="padding:36px 40px;">
    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Quote Reference</p>
    <p style="margin:0 0 24px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">${ref}</p>

    <p style="margin:0 0 22px;font-size:15px;color:#374151;line-height:1.7;">
      Dear ${esc(name)},<br><br>
      Thank you for your quote request. Our sales team has received your enquiry and will respond within <strong>4 business hours</strong>. Please quote reference <strong>${ref}</strong> in any follow-up.
    </p>

    <div style="background:#f8f9fa;border-radius:8px;padding:20px 24px;margin-bottom:28px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Your Request</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;width:140px;color:#6b7280;">Part Number</td><td style="padding:4px 0;font-weight:600;">${esc(part_number) || '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Quantity</td><td style="padding:4px 0;">${esc(quantity) || '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Delivery</td><td style="padding:4px 0;">${esc(delivery) || '—'}</td></tr>
        ${message ? `<tr><td style="padding:4px 0;color:#6b7280;vertical-align:top;">Notes</td><td style="padding:4px 0;">${esc(message)}</td></tr>` : ''}
      </table>
    </div>

    ${spec.label ? `
    <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">Product Specification — ${esc(spec.label)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:4px;">
      <tr style="background:#f3f4f6;"><td style="padding:10px 16px;font-weight:600;width:50%;">Standard</td><td style="padding:10px 16px;">${esc(spec.spec) || '—'}</td></tr>
      <tr><td style="padding:10px 16px;font-weight:600;border-top:1px solid #e5e7eb;">Insulation</td><td style="padding:10px 16px;border-top:1px solid #e5e7eb;">${esc(spec.insulation) || '—'}</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:10px 16px;font-weight:600;">Temp. Rating</td><td style="padding:10px 16px;">${esc(spec.temp) || '—'}</td></tr>
      <tr><td style="padding:10px 16px;font-weight:600;border-top:1px solid #e5e7eb;">Test Voltage</td><td style="padding:10px 16px;border-top:1px solid #e5e7eb;">${esc(spec.testVoltage) || '—'}</td></tr>
    </table>
    ${sizesTable}
    ` : ''}

    <div style="margin-top:28px;padding:18px 22px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#92400e;">What happens next?</p>
      <ol style="margin:0;padding-left:18px;font-size:13px;color:#78350f;line-height:1.8;">
        <li>Our sales team reviews your requirement</li>
        <li>We prepare a formal quotation with pricing &amp; lead time</li>
        <li>You receive the quote within 4 business hours</li>
      </ol>
    </div>
  </td></tr>

  <tr>
    <td style="background:#f3f4f6;padding:22px 40px;border-top:1px solid #e5e7eb;">
      <p style="margin:0 0 3px;font-size:13px;color:#6b7280;font-weight:500;">Siechem Technologies Pvt. Ltd.</p>
      <p style="margin:0 0 3px;font-size:12px;color:#9ca3af;">26/27 Errabalu Chetty Street, Chennai – 600 001, Tamil Nadu, India</p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        <a href="mailto:sales@siechem.com" style="color:#e31e24;text-decoration:none;">sales@siechem.com</a>
        &nbsp;·&nbsp;
        <a href="https://siechem.vercel.app" style="color:#e31e24;text-decoration:none;">siechem.vercel.app</a>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body></html>`;

  return { ref, html };
}

// ─── Handler ─────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, company, email, part_number, quantity, delivery, message, cable_type, cable_spec, subject, hp_website } = req.body || {};

  // Honeypot: hp_website is a hidden field no real visitor can see or reach
  // by tab order, so anything filling it is a bot. Return success without
  // sending mail -- a 4xx here would tell the bot which field to drop.
  if (hp_website) {
    return res.status(200).json({ success: true });
  }
  // Basic shape check on the two fields every legitimate submission has --
  // rejects obviously-scripted junk before it ever reaches Gmail, without
  // being strict enough to bounce a real customer's odd-but-valid input.
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const { host, port, secure, user, pass, salesInbox } = mailConfig();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
  const errors = [];

  // ── 1. Company notification ───────────────────────────────────────────────
  try {
    await transporter.sendMail({
      from: `"Siechem Website" <${user}>`,
      to: salesInbox,
      replyTo: email || '',
      subject: `New Quote Request – ${part_number || 'Automotive Cable'} – ${company || name || 'Unknown'}`,
      html: companyEmailHtml({ name, phone, company, email, part_number, cable_type, quantity, delivery, message })
    });
    console.log('[quote] Company notification sent');
  } catch (err) {
    console.error('[quote] Company email failed:', err.message);
    errors.push('company: ' + err.message);
  }

  // ── 2. Customer spec sheet ────────────────────────────────────────────────
  if (email) {
    try {
      const { ref, html } = buildSpecEmail({ name, part_number, quantity, delivery, message, cable_spec });
      await transporter.sendMail({
        from: `"Siechem Cables" <${user}>`,
        to: email,
        subject: `Quote Received [${ref}] – ${part_number || 'Your Enquiry'} – Siechem`,
        html
      });
      console.log('[quote] Customer spec email sent to', email, 'ref:', ref);
    } catch (err) {
      console.error('[quote] Customer email failed:', err.message);
      errors.push('customer: ' + err.message);
    }
  }

  if (errors.length === 2) {
    return res.status(500).json({ success: false, message: errors.join(' | ') });
  }
  return res.status(200).json({ success: true, warnings: errors.length ? errors : undefined });
};
