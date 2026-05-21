const TECH_HIGHLIGHTS = [
  {
    icon: (c) => (
      <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
        <circle cx="16" cy="16" r="12"/>
        <path d="M10 16 Q13 10 16 16 Q19 22 22 16"/>
        <line x1="16" y1="4" x2="16" y2="8"/>
        <line x1="16" y1="24" x2="16" y2="28"/>
        <line x1="4" y1="16" x2="8" y2="16"/>
        <line x1="24" y1="16" x2="28" y2="16"/>
      </svg>
    ),
    title: 'Electron-Beam Crosslinking',
    desc: 'In-house E-beam irradiation facility enabling superior thermal, mechanical and chemical resistance — a capability held by very few global wire manufacturers.',
  },
  {
    icon: (c) => (
      <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 26 L6 14 L14 8 L22 14 L22 26 Z"/>
        <line x1="6" y1="20" x2="22" y2="20"/>
        <line x1="14" y1="8" x2="14" y2="4"/>
        <line x1="10" y1="20" x2="10" y2="26"/>
        <line x1="18" y1="20" x2="18" y2="26"/>
        <line x1="6" y1="26" x2="22" y2="26"/>
      </svg>
    ),
    title: 'LSZH & Halogen-Free Compounds',
    desc: 'Proprietary low-smoke zero-halogen formulations for tunnel, rail and public-space applications with full EN 50525 and BS 7655 compliance.',
  },
  {
    icon: (c) => (
      <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
        <rect x="6" y="10" width="20" height="16" rx="2"/>
        <path d="M10 10 V7 Q10 4 13 4 H19 Q22 4 22 7 V10"/>
        <line x1="13" y1="18" x2="19" y2="18" strokeWidth="2.2"/>
        <line x1="16" y1="15" x2="16" y2="21" strokeWidth="2.2"/>
      </svg>
    ),
    title: 'High-Temperature Insulation',
    desc: 'PTFE, silicone and ETFE insulated wires rated from –65°C to +260°C for aerospace, industrial furnace and powertrain applications.',
  },
  {
    icon: (c) => (
      <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 20 L10 14 L16 18 L22 10 L28 14"/>
        <circle cx="4" cy="20" r="2" fill={c} fillOpacity="0.3"/>
        <circle cx="16" cy="18" r="2" fill={c} fillOpacity="0.3"/>
        <circle cx="28" cy="14" r="2" fill={c} fillOpacity="0.3"/>
        <line x1="4" y1="26" x2="28" y2="26" strokeWidth="0.8" strokeDasharray="3 2"/>
      </svg>
    ),
    title: 'Custom R&D & Rapid Prototyping',
    desc: 'Dedicated materials science team to develop application-specific compounds. From spec sheet to validated prototype in weeks, not months.',
  },
];

const CERTS = [
  { name: 'TUV', sub: 'Rheinland' },
  { name: 'UL', sub: 'Listed' },
  { name: 'CE', sub: 'Marking' },
  { name: 'RoHS', sub: 'Compliant' },
  { name: 'IEC', sub: 'Standards' },
  { name: 'IS', sub: 'BIS India' },
  { name: 'MIL', sub: 'Spec' },
  { name: 'BS', sub: 'British Std' },
];

const STATS = [
  { val: '100,000', unit: 'sq.ft', label: 'Manufacturing Facility' },
  { val: '50+', unit: '', label: 'Countries Served' },
  { val: '22M+', unit: '', label: 'Catalogue Configurations' },
  { val: '2002', unit: '', label: 'Established, Chennai' },
];

function SiechemCapabilities({ accent }) {
  return (
    <section id="capabilities" style={{ background: '#F8FAFC', padding: '100px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>Why Siechem</p>
          <h2 style={{ fontSize: 'clamp(30px,3.5vw,46px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.8px', lineHeight: 1.13, marginBottom: 16 }}>
            Built for Mission-Critical Performance
          </h2>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
            Advanced materials science, proprietary compounding and end-to-end in-house production deliver the reliability global OEMs depend on.
          </p>
        </div>

        {/* Tech highlights grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 80 }}>
          {TECH_HIGHLIGHTS.map((t, i) => (
            <div key={i} style={{ background: '#FFFFFF', borderRadius: 14, padding: '32px 28px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 12, background: accent + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {t.icon(accent)}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 10, lineHeight: 1.3 }}>{t.title}</h3>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats + certifications strip */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #E2E8F0' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '36px 32px', borderRight: i < 3 ? '1px solid #E2E8F0' : 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', letterSpacing: '-1px' }}>
                  {s.val}<span style={{ fontSize: 18, color: accent, marginLeft: 2 }}>{s.unit}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', background: '#F8FAFC' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', flexShrink: 0 }}>Certifications &amp; Standards</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
              {CERTS.map(c => (
                <div key={c.name} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', textAlign: 'center', minWidth: 70 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500, marginTop: 1 }}>{c.sub}</div>
                </div>
              ))}
            </div>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: accent, borderRadius: 8, color: '#FFF', textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
              Request Compliance Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { SiechemCapabilities });
