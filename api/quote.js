// Vercel serverless function — POST /api/quote
// 1. Forwards quote to company via Web3Forms
// 2. Emails product spec sheet to customer via Resend
//
// Env vars required in Vercel dashboard:
//   RESEND_API_KEY  — from resend.com (free plan: 3,000 emails/month)
//   RESEND_FROM     — e.g. "Siechem Cables <quotes@yourdomain.com>"
//                    (use "Siechem Cables <onboarding@resend.dev>" while testing)

const { Resend } = require('resend');

const WEB3FORMS_KEY = 'adac1a08-b909-4780-913f-ded062c472a5';
const COMPANY_EMAIL = 'nareshkumargs3105@gmail.com';

// ─── HTML email template ────────────────────────────────────────────────────
function buildSpecEmail({ name, part_number, quantity, delivery, message, cable_spec }) {
  const ref = 'SC-' + Date.now().toString(36).toUpperCase().slice(-6);
  const spec = typeof cable_spec === 'string' ? JSON.parse(cable_spec) : (cable_spec || {});

  const sizesRows = (spec.allSizes || []).map(s => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:8px 12px;font-family:monospace;font-size:13px;">${s.size} ${spec.unit || 'mm²'}</td>
      <td style="padding:8px 12px;text-align:center;">${s.amps} A</td>
      <td style="padding:8px 12px;text-align:center;">${s.ohm} mΩ/m</td>
      <td style="padding:8px 12px;text-align:center;">${s.od_mm} mm</td>
      <td style="padding:8px 12px;text-align:center;">${s.weight} kg/km</td>
      <td style="padding:8px 12px;text-align:center;">${s.stdLen} m</td>
    </tr>`).join('');

  const sizesTable = sizesRows ? `
    <h3 style="margin:28px 0 12px;font-size:15px;color:#111827;">Complete Size Range</h3>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;white-space:nowrap;">Size</th>
            <th style="padding:8px 12px;font-weight:600;">Current</th>
            <th style="padding:8px 12px;font-weight:600;">Resistance</th>
            <th style="padding:8px 12px;font-weight:600;">O.D.</th>
            <th style="padding:8px 12px;font-weight:600;">Weight</th>
            <th style="padding:8px 12px;font-weight:600;">Std. Length</th>
          </tr>
        </thead>
        <tbody>${sizesRows}</tbody>
      </table>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f0f14 0%,#1a0a0b 100%);padding:32px 40px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Siechem</span>
              <span style="color:rgba(255,255,255,0.4);font-size:14px;">|</span>
              <span style="color:rgba(255,255,255,0.6);font-size:13px;">Progress Through Research</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">

          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Quote Reference</p>
          <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;">${ref}</p>

          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
            Dear ${name},<br><br>
            Thank you for your enquiry. We have received your quote request and our sales team will respond within <strong>4 business hours</strong>. Your quote reference is <strong>${ref}</strong> — please quote this in any follow-up correspondence.
          </p>

          <!-- Your request summary -->
          <div style="background:#f8f9fa;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
            <h3 style="margin:0 0 14px;font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Your Request</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
              <tr><td style="padding:4px 0;width:140px;color:#6b7280;">Part Number</td><td style="padding:4px 0;font-weight:600;">${part_number || '—'}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;">Quantity</td><td style="padding:4px 0;">${quantity || '—'}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;">Delivery</td><td style="padding:4px 0;">${delivery || '—'}</td></tr>
              ${message ? `<tr><td style="padding:4px 0;color:#6b7280;vertical-align:top;">Notes</td><td style="padding:4px 0;">${message}</td></tr>` : ''}
            </table>
          </div>

          ${spec.label ? `
          <!-- Product specification -->
          <h3 style="margin:0 0 14px;font-size:15px;color:#111827;">Product Specification — ${spec.label}</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:4px;">
            <tr style="background:#f3f4f6;">
              <td style="padding:10px 16px;font-weight:600;width:50%;">Standard</td>
              <td style="padding:10px 16px;">${spec.spec || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-weight:600;border-top:1px solid #e5e7eb;">Insulation</td>
              <td style="padding:10px 16px;border-top:1px solid #e5e7eb;">${spec.insulation || '—'}</td>
            </tr>
            <tr style="background:#f3f4f6;">
              <td style="padding:10px 16px;font-weight:600;">Temp. Rating</td>
              <td style="padding:10px 16px;">${spec.temp || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-weight:600;border-top:1px solid #e5e7eb;">Test Voltage</td>
              <td style="padding:10px 16px;border-top:1px solid #e5e7eb;">${spec.testVoltage || '—'}</td>
            </tr>
          </table>
          ${sizesTable}
          ` : ''}

          <!-- Next steps -->
          <div style="margin-top:32px;padding:20px 24px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
            <h3 style="margin:0 0 10px;font-size:14px;color:#92400e;font-weight:600;">What happens next?</h3>
            <ol style="margin:0;padding-left:20px;font-size:13.5px;color:#78350f;line-height:1.7;">
              <li>Our sales team reviews your requirement</li>
              <li>We prepare a formal quotation with pricing and lead time</li>
              <li>You receive the quote within 4 business hours</li>
            </ol>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f3f4f6;padding:24px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Siechem Technologies Pvt. Ltd.</p>
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">26/27 Errabalu Chetty Street, Chennai – 600 001, Tamil Nadu, India</p>
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
</body>
</html>`;
}

// ─── Handler ────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    access_key, subject, from_name, redirect, botcheck, cable_type, cable_spec,
    name, phone, company, email, part_number, quantity, delivery, message
  } = req.body || {};

  // ── 1. Forward to Web3Forms (company notification) ──────────────────────
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: subject || `Quote Request – ${part_number} – Siechem Automotive Cables`,
        from_name: name || 'Siechem Website',
        redirect: 'false',
        name, phone, company, email, part_number,
        cable_type: cable_type || '',
        quantity, delivery, message
      })
    });
  } catch (err) {
    console.error('[Web3Forms]', err.message);
    // Non-fatal — continue to Resend
  }

  // ── 2. Send spec sheet email to customer via Resend ──────────────────────
  if (email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM || 'Siechem Cables <onboarding@resend.dev>';
      await resend.emails.send({
        from,
        to: [email],
        subject: `Quote Received – ${part_number || 'Your Enquiry'} – Siechem Automotive Cables`,
        html: buildSpecEmail({ name, part_number, quantity, delivery, message, cable_spec })
      });
    } catch (err) {
      console.error('[Resend]', err.message);
      // Non-fatal — quote was already forwarded to company
    }
  }

  return res.status(200).json({ success: true });
};
