const { useState, useEffect } = React;

const STATS = [
  { value: '22M+', label: 'Part Numbers' },
  { value: '35+', label: 'Industry Segments' },
  { value: '50+', label: 'Global Standards' },
  { value: '20+', label: 'Years R&D' },
];

function CableSVG({ accent }) {
  return (
    <svg viewBox="0 0 320 320" width="440" height="440" style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', opacity: 0.92, filter: 'drop-shadow(0 0 60px rgba(227,30,36,0.1))' }}>
      <defs>
        <radialGradient id="jacketGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#263548"/>
          <stop offset="100%" stopColor="#0d1726"/>
        </radialGradient>
        <radialGradient id="coreGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F24B51"/>
          <stop offset="100%" stopColor="#B3151A"/>
        </radialGradient>
        <radialGradient id="outerCoreGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E31E24"/>
          <stop offset="100%" stopColor="#B3151A"/>
        </radialGradient>
        <radialGradient id="insGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2d4a7a"/>
          <stop offset="100%" stopColor="#1a2d50"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer jacket */}
      <circle cx="160" cy="160" r="155" fill="url(#jacketGrad)"/>
      <circle cx="160" cy="160" r="155" fill="none" stroke="#334155" strokeWidth="4"/>
      <circle cx="160" cy="160" r="148" fill="none" stroke="#1e3050" strokeWidth="1.5"/>

      {/* Shield / armour braid - dashed ring */}
      <circle cx="160" cy="160" r="130" fill="none" stroke="#2d4060" strokeWidth="3.5" strokeDasharray="6 4.5" opacity="0.8"/>

      {/* Bedding */}
      <circle cx="160" cy="160" r="117" fill="#111d2e"/>

      {/* Center conductor */}
      <circle cx="160" cy="160" r="24" fill="url(#insGrad)"/>
      <circle cx="160" cy="160" r="15" fill="url(#coreGrad)" filter="url(#glow)"/>

      {/* 6 outer conductors at 60° intervals, r=64 from center */}
      {[0,60,120,180,240,300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 160 + 64 * Math.cos(rad);
        const cy = 160 + 64 * Math.sin(rad);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="24" fill="url(#insGrad)"/>
            <circle cx={cx} cy={cy} r="15" fill="url(#outerCoreGrad)"/>
          </g>
        );
      })}

      {/* Highlight gloss */}
      <ellipse cx="118" cy="78" rx="42" ry="22" fill="white" opacity="0.055" transform="rotate(-25 118 78)"/>

      {/* Label ring lines */}
      <line x1="160" y1="4" x2="160" y2="20" stroke="#475569" strokeWidth="1" opacity="0.5"/>
      <line x1="313" y1="113" x2="298" y2="122" stroke="#475569" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

function SiechemHero({ accent }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 120,
      }}
    >
      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4,
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }}/>

      {/* Radial gradient vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%)' }}/>

      {/* Accent glow */}
      <div style={{ position: 'absolute', top: '30%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)`, pointerEvents: 'none' }}/>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left — text */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'opacity 0.7s, transform 0.7s' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(227,30,36,0.08)', border: `1px solid ${accent}25`, borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }}></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: accent, letterSpacing: '0.05em' }}>India's #1 Specialty Wires & Cables</span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 4.5vw, 64px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-1.5px', color: '#0F172A', marginBottom: 24 }}>
            Precision Wiring<br/>
            for <span style={{ color: accent }}>Critical</span><br/>
            Applications
          </h1>

          <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}>
            22 million+ specialty wire &amp; cable configurations engineered for Aerospace, Defence, Automotive, Marine, and Industrial sectors. Zero compromise on specification.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
            <a href="#segments" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: accent, color: '#FFFFFF', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Explore Products
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </a>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', border: '1.5px solid #CBD5E1', color: '#0F172A', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0F172A'; e.currentTarget.style.background = 'rgba(15,23,42,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}
            >
              Request Custom Quote
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — cable illustration */}
        <div style={{ position: 'relative', height: 440, opacity: visible ? 1 : 0, transition: 'opacity 1s 0.3s' }}>
          <CableSVG accent={accent}/>

          {/* Floating labels */}
          <div style={{ position: 'absolute', top: '20%', left: 10, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Outer Jacket</div>
            <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>LSZH / PVC / XLPE</div>
          </div>
          <div style={{ position: 'absolute', bottom: '28%', left: 0, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Conductor</div>
            <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Cu / Al · AWG 30–4/0</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, transparent, #F8FAFC)' }}/>
    </section>
  );
}

Object.assign(window, { SiechemHero });
