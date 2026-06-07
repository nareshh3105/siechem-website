/**
 * FILE: components/SiechemFooter.jsx
 *
 * PURPOSE:
 *   React component that renders the site footer for the React prototype
 *   (siechem-redesign-2d.html). Displays the full site map, contact information,
 *   and legal/copyright line.
 *
 * CONTENT (FOOTER_COLS array):
 *   Column 1 — Products:  links to product segment pages (Aerospace, Automotive, Marine,
 *                          Solar, Industrial, full products listing)
 *   Column 2 — Engineering: links to tech-support.html tools (AWG Converter, Voltage
 *                            Drop, Current Capacity, All Tools)
 *   Column 3 — Company:   About, Certifications, Customers, Careers, Contact
 *   Column 4 — Contact:   sales@siechem.com, phone number, Chennai / Pondicherry address
 *
 *   Brand column (left): Siechem logo SVG, tagline "India's leading specialty wires
 *   & cables manufacturer since 2002", social links (LinkedIn, Twitter/X).
 *
 *   Footer meta bar: copyright line, certifications shorthand (ISO 9001, IATF 16949,
 *   AS9100D), Vercel hosting note.
 *
 * PROPS:
 *   accent  {string}  — CSS colour for link hover states and the logo red
 *
 * WHY THE FOOTER IS A COMPONENT:
 *   In the React prototype, the footer is shared across all "pages" (even though the
 *   prototype is a single-page app). Extracting it to a component means it's defined
 *   once and updated in one place. In the static HTML site, the footer is duplicated
 *   in each HTML file — a known trade-off of the no-bundler static approach.
 *
 * NOTE:
 *   Used only in the React prototype (siechem-redesign-2d.html). The static HTML
 *   pages each contain the footer HTML inline, styled by theme.css .footer classes.
 */
const FOOTER_COLS = [
  {
    heading: 'Products',
    links: ['Aerospace & Defence','Automotive & EV','Renewable Energy','Marine & Offshore','Railway & Metro','Oil & Gas','Building Wires','Industrial Control'],
  },
  {
    heading: 'Standards',
    links: ['UL / CSA Cables','IEC Certified','MIL-Spec Wire','BS EN Standards','IS Standards','SAE / JASO','VDE / DIN','TUV Certified'],
  },
  {
    heading: 'Engineering',
    links: ['AWG Converter','Voltage Drop Calc','Current Capacity','Cable Databook','Technical Library','Custom Spec Builder','Request Sample','Distributor Portal'],
  },
  {
    heading: 'Company',
    links: ['About Siechem','R&D Centre','Manufacturing','Quality & Certs','CSR Initiatives','Careers','News & Press','Contact Us'],
  },
];

function SiechemFooter({ accent }) {
  return (
    <footer style={{ background: '#0A1628', color: '#94A3B8', fontFamily: 'inherit' }}>
      {/* CTA band */}
      <div style={{ background: accent, padding: '52px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px', marginBottom: 8 }}>Have a specification in mind?</h3>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 480 }}>Our applications engineering team is ready to match or develop the exact cable you need — from a single prototype to full production runs.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#FFFFFF', color: accent, textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
              Request a Quote
            </a>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', border: '2px solid rgba(255,255,255,0.5)', color: '#FFFFFF', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15 }}>
              Download Catalogue
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 48, marginBottom: 56 }}>
          {/* Brand col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 34, height: 34, borderRadius: 7, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="9" strokeDasharray="4 3"/>
                  <line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: '#F8FAFC' }}>SIECHEM</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#94A3B8', maxWidth: 260, marginBottom: 28 }}>
              India's leading specialty wires &amp; cables manufacturer. Engineering precision for the world's most critical systems since 2002.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#94A3B8' }}>
              <div>Head Office: Chennai, Tamil Nadu, India</div>
              <div>Factory: Pondicherry, India</div>
              <a href="mailto:sales@siechem.com" style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>sales@siechem.com</a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F8FAFC', marginBottom: 20 }}>{col.heading}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: 13.5, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = '#FFFFFF'}
                      onMouseLeave={e => e.target.style.color = '#94A3B8'}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#64748B' }}>© 2026 Siechem Technologies Pvt. Ltd. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748B' }}>
            {['Privacy Policy','Terms of Use','Cookie Settings','Sitemap'].map(l => (
              <a key={l} href="#" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#FFFFFF'}
                onMouseLeave={e => e.target.style.color = '#64748B'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { SiechemFooter });
