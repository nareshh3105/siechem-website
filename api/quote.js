// Vercel serverless function — POST /api/quote
// Sends two emails via Gmail SMTP (nodemailer):
//   1. Company notification  → GMAIL_USER (nareshkumargs3105@gmail.com)
//   2. Customer spec sheet   → customer's email
//
// Env vars (set in Vercel dashboard):
//   GMAIL_USER  — nareshkumargs3105@gmail.com
//   GMAIL_PASS  — 16-char Gmail App Password (no spaces)

const nodemailer = require('nodemailer');

const COMPANY_EMAIL = process.env.GMAIL_USER;

// ─── Company notification email (plain summary) ─────────────────────────────
function companyEmailHtml({ name, phone, company, email, part_number, cable_type, quantity, delivery, message }) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#e31e24;margin:0 0 16px;">New Quote Request — Siechem Automotive Cables</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:160px;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${name || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${phone || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Company</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${company || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}">${email || '—'}</a></td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Part Number</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${part_number || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Cable Type</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${cable_type || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Quantity</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${quantity || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Delivery</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${delivery || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;vertical-align:top;">Notes</td><td style="padding:8px 12px;">${message || '—'}</td></tr>
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
      <td style="padding:8px 14px;font-family:monospace;font-size:13px;border-bottom:1px solid #e5e7eb;">${s.size} ${spec.unit || 'mm²'}</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${s.amps} A</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${s.ohm} mΩ/m</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${s.od_mm} mm</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${s.weight} kg/km</td>
      <td style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;">${s.stdLen} m</td>
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
      Dear ${name},<br><br>
      Thank you for your quote request. Our sales team has received your enquiry and will respond within <strong>4 business hours</strong>. Please quote reference <strong>${ref}</strong> in any follow-up.
    </p>

    <div style="background:#f8f9fa;border-radius:8px;padding:20px 24px;margin-bottom:28px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Your Request</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;width:140px;color:#6b7280;">Part Number</td><td style="padding:4px 0;font-weight:600;">${part_number || '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Quantity</td><td style="padding:4px 0;">${quantity || '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Delivery</td><td style="padding:4px 0;">${delivery || '—'}</td></tr>
        ${message ? `<tr><td style="padding:4px 0;color:#6b7280;vertical-align:top;">Notes</td><td style="padding:4px 0;">${message}</td></tr>` : ''}
      </table>
    </div>

    ${spec.label ? `
    <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">Product Specification — ${spec.label}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:4px;">
      <tr style="background:#f3f4f6;"><td style="padding:10px 16px;font-weight:600;width:50%;">Standard</td><td style="padding:10px 16px;">${spec.spec || '—'}</td></tr>
      <tr><td style="padding:10px 16px;font-weight:600;border-top:1px solid #e5e7eb;">Insulation</td><td style="padding:10px 16px;border-top:1px solid #e5e7eb;">${spec.insulation || '—'}</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:10px 16px;font-weight:600;">Temp. Rating</td><td style="padding:10px 16px;">${spec.temp || '—'}</td></tr>
      <tr><td style="padding:10px 16px;font-weight:600;border-top:1px solid #e5e7eb;">Test Voltage</td><td style="padding:10px 16px;border-top:1px solid #e5e7eb;">${spec.testVoltage || '—'}</td></tr>
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

  const { name, phone, company, email, part_number, quantity, delivery, message, cable_type, cable_spec, subject } = req.body || {};

  // Temporary debug — remove after confirming env vars are injected
  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_PASS || '').trim();
  if (!gmailUser || !gmailPass) {
    return res.status(500).json({
      success: false,
      debug: {
        GMAIL_USER: gmailUser ? `${gmailUser.slice(0,5)}…` : 'MISSING',
        GMAIL_PASS: gmailPass ? `set(${gmailPass.length}chars)` : 'MISSING',
        env_keys: Object.keys(process.env).filter(k => k.startsWith('GMAIL'))
      }
    });
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass }
  });
  const errors = [];

  // ── 1. Company notification ───────────────────────────────────────────────
  try {
    await transporter.sendMail({
      from: `"Siechem Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
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
        from: `"Siechem Cables" <${process.env.GMAIL_USER}>`,
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
