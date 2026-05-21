const { useState } = React;

const SegIcon = ({ type, color }) => {
  const s = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    aerospace: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <path d="M16 4 L28 20 L22 18 L20 28 L16 24 L12 28 L10 18 L4 20 Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.4"/>
      <line x1="10" y1="18" x2="22" y2="18" strokeWidth="1"/>
    </svg>,
    automotive: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <path d="M4 18 L7 10 L25 10 L28 18 L28 22 L4 22 Z" fill={color} fillOpacity="0.12"/>
      <circle cx="10" cy="23" r="3"/><circle cx="22" cy="23" r="3"/>
      <line x1="7" y1="15" x2="25" y2="15"/>
      <line x1="13" y1="10" x2="11" y2="15"/><line x1="19" y1="10" x2="21" y2="15"/>
    </svg>,
    solar: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <circle cx="16" cy="16" r="5" fill={color} fillOpacity="0.15"/>
      <line x1="16" y1="3" x2="16" y2="7"/><line x1="16" y1="25" x2="16" y2="29"/>
      <line x1="3" y1="16" x2="7" y2="16"/><line x1="25" y1="16" x2="29" y2="16"/>
      <line x1="7.3" y1="7.3" x2="10.1" y2="10.1"/><line x1="21.9" y1="21.9" x2="24.7" y2="24.7"/>
      <line x1="24.7" y1="7.3" x2="21.9" y2="10.1"/><line x1="10.1" y1="21.9" x2="7.3" y2="24.7"/>
    </svg>,
    marine: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <circle cx="16" cy="9" r="2.5"/><line x1="16" y1="11.5" x2="16" y2="24"/>
      <line x1="8" y1="14" x2="24" y2="14"/>
      <path d="M7 24 Q16 30 25 24" fill={color} fillOpacity="0.12"/>
    </svg>,
    railway: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <rect x="7" y="5" width="18" height="18" rx="2.5" fill={color} fillOpacity="0.1"/>
      <line x1="7" y1="12" x2="25" y2="12"/><line x1="7" y1="18" x2="25" y2="18"/>
      <line x1="12" y1="23" x2="10" y2="28"/><line x1="20" y1="23" x2="22" y2="28"/>
      <line x1="7" y1="28" x2="25" y2="28"/>
    </svg>,
    oil: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <path d="M16 3 C16 3 6 14 6 20 A10 10 0 0 0 26 20 C26 14 16 3 16 3Z" fill={color} fillOpacity="0.12"/>
      <path d="M12 20 Q14 17 16 20 Q18 23 20 20" strokeWidth="1.3"/>
    </svg>,
    building: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <rect x="3" y="8" width="26" height="21" fill={color} fillOpacity="0.1"/>
      <line x1="3" y1="14" x2="29" y2="14"/><line x1="3" y1="20" x2="29" y2="20"/>
      <line x1="11" y1="8" x2="11" y2="29"/><line x1="21" y1="8" x2="21" y2="29"/>
      <rect x="13.5" y="22" width="5" height="7"/>
      <path d="M3 8 L16 3 L29 8"/>
    </svg>,
    industrial: <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
      <circle cx="16" cy="16" r="4" fill={color} fillOpacity="0.15"/>
      <path d="M16 5v4M16 23v4M5 16h4M23 16h4M8.3 8.3l2.8 2.8M20.9 20.9l2.8 2.8M23.7 8.3l-2.8 2.8M11.1 20.9l-2.8 2.8" strokeWidth="2"/>
    </svg>,
  };
  return icons[type] || null;
};

const SEGMENTS = [
  { id: 'aerospace', label: 'Aerospace & Defence', desc: 'MIL-Spec, AS22759, DEF STAN and space-grade wiring for the most demanding environments.', standards: 'MIL-DTL-16878 · AS22759 · DEF STAN' },
  { id: 'automotive', label: 'Automotive & EV', desc: 'High-flex, heat-resistant auto wires for ICE and battery electric vehicles with global compliance.', standards: 'JASO D611 · ISO 6722 · LV216' },
  { id: 'solar', label: 'Renewable Energy', desc: 'UV-stabilised solar DC cables, wind turbine cabling and energy storage interconnects.', standards: 'TUV 2PfG 1169 · EN 50618 · IEC 62930' },
  { id: 'marine', label: 'Marine & Offshore', desc: 'Flame-retardant, water-resistant cables for shipboard, subsea and offshore platform installations.', standards: 'IEC 60092 · NEK 606 · Lloyd\'s' },
  { id: 'railway', label: 'Railway & Metro', desc: 'LSZH, fire-retardant rolling stock and trackside cabling certified to European railway fire standards.', standards: 'EN 45545-2 · NFF 16-101 · IS 16000' },
  { id: 'oil', label: 'Oil & Gas', desc: 'Armoured, instrumentation and control cables engineered for hazardous petrochemical zones.', standards: 'IEC 60502 · BS 5308 · ATEX' },
  { id: 'building', label: 'Building & Infrastructure', desc: 'Power, data and fire-survival cables for commercial, institutional and data-centre applications.', standards: 'IEC 60332 · BS 6387 · UL 44' },
  { id: 'industrial', label: 'Industrial Control', desc: 'Flexible control, signal and power cables for automation, robotics and heavy machinery.', standards: 'IEC 60228 · UL 508 · PROFIBUS' },
];

function SegmentCard({ seg, accent, hovered, onHover, onLeave }) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '28px 28px 24px',
        border: `1px solid ${hovered ? accent + '50' : '#E2E8F0'}`,
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px ${accent}30` : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Icon */}
      <div style={{ width: 48, height: 48, borderRadius: 10, background: hovered ? accent + '18' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}>
        <SegIcon type={seg.id} color={hovered ? accent : '#64748B'} />
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, lineHeight: 1.3 }}>{seg.label}</h3>
        <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, marginBottom: 12 }}>{seg.desc}</p>
        <p style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.02em' }}>{seg.standards}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: hovered ? accent : '#94A3B8', transition: 'color 0.2s' }}>
        Explore products
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

function SiechemSegments({ accent }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="segments" style={{ background: '#F8FAFC', padding: '100px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div style={{ maxWidth: 640, marginBottom: 60 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>Sectors We Serve</p>
          <h2 style={{ fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', lineHeight: 1.12, marginBottom: 18 }}>
            Engineering Solutions<br/>by Industry
          </h2>
          <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.7 }}>
            From electron-beam crosslinked aerospace wire to LSZH railway cabling — every segment is backed by dedicated R&amp;D and global certification.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {SEGMENTS.map(seg => (
            <SegmentCard
              key={seg.id}
              seg={seg}
              accent={accent}
              hovered={hovered === seg.id}
              onHover={() => setHovered(seg.id)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>

        {/* CTA strip */}
        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 36px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>Looking for a specific cable specification?</p>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Our engineering team can source or manufacture to your exact requirements.</p>
          </div>
          <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: accent, color: '#FFFFFF', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
            Talk to an Engineer
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 3l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { SiechemSegments });
