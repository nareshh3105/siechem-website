const { useState, useRef, useEffect } = React;

const SEARCH_SUGGESTIONS = [
  { cat: 'Product', text: 'Aerospace Cable · MIL-DTL-16878 / AS22759' },
  { cat: 'Product', text: 'Solar Cable · TUV 2PfG 1169 / EN 50618' },
  { cat: 'Product', text: 'LSZH Railway Cable · EN 45545-2' },
  { cat: 'Product', text: 'Marine Shipboard Cable · IEC 60092' },
  { cat: 'Product', text: 'Automotive Wire · JASO D611 / ISO 6722' },
  { cat: 'Standard', text: 'UL 44 — Thermoset-Insulated Wires & Cables' },
  { cat: 'Standard', text: 'IEC 60228 — Conductors of Insulated Cables' },
  { cat: 'Standard', text: 'MIL-DTL-16878 — Mil-Spec Electrical Wire' },
  { cat: 'Tool', text: 'AWG to mm² Converter', href: '#calculator' },
  { cat: 'Tool', text: 'Voltage Drop Calculator', href: '#calculator' },
  { cat: 'Tool', text: 'Current Carrying Capacity Tool', href: '#calculator' },
];

const MEGAMENU = [
  {
    heading: 'By Industry',
    items: ['Aerospace & Defence','Automotive & EV','Renewable Energy','Marine & Offshore','Railway & Metro','Oil & Gas','Building & Infrastructure','Industrial Control'],
    cta: 'View All Industries',
  },
  {
    heading: 'By Standard',
    items: ['UL / CSA','IEC Standards','MIL-Spec','BS EN','IS Standards','SAE / JASO','VDE / DIN','TUV Certified'],
    cta: 'Browse Standards',
  },
  {
    heading: 'Engineering Desk',
    items: ['AWG Converter','Voltage Drop Calc','Current Capacity','Cable Life Estimator','Technical Library','Custom Spec Builder'],
    cta: 'Open Tools',
    highlight: true,
  },
];

const NavLink = ({ children, hasMenu, isActive, onEnter, onLeave, accent }) => (
  <div
    style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', cursor: 'pointer', borderRadius: 6, fontSize: 14, fontWeight: 500, color: isActive ? accent : '#475569', transition: 'color 0.15s, background 0.15s', whiteSpace: 'nowrap' }}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    {children}
    {hasMenu && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )}
  </div>
);

function SiechemNav({ accent }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const closeTimer = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleMenuEnter = () => { clearTimeout(closeTimer.current); setMenuOpen(true); };
  const handleMenuLeave = () => { closeTimer.current = setTimeout(() => setMenuOpen(false), 180); };

  const filtered = searchQuery.length > 1
    ? SEARCH_SUGGESTIONS.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_SUGGESTIONS.slice(0, 6);

  const navBg = scrolled ? 'rgba(255, 255, 255, 0.96)' : 'transparent';
  const navShadow = scrolled ? '0 1px 8px rgba(0, 0, 0, 0.08)' : 'none';

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: navBg, backdropFilter: scrolled ? 'blur(16px)' : 'none', boxShadow: navShadow, borderBottom: scrolled ? 'none' : '1px solid rgba(15,23,42,0.08)', transition: 'background 0.3s, box-shadow 0.3s' }}>
      {/* Top utility bar */}
      <div style={{ borderBottom: '1px solid rgba(15,23,42,0.08)', padding: '6px 0', display: scrolled ? 'none' : 'block' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: 12, color: '#64748B' }}>
          <span>Established 2002 · Chennai, India</span>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>+91-44-XXXX-XXXX</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>sales@siechem.com</a>
        </div>
      </div>

      {/* Main nav */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 40, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="4"/>
              <circle cx="12" cy="12" r="9" strokeDasharray="4 3"/>
              <line x1="12" y1="3" x2="12" y2="7"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: '#0F172A' }}>SIECHEM</span>
        </a>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
            <NavLink hasMenu isActive={menuOpen} accent={accent} onEnter={handleMenuEnter} onLeave={handleMenuLeave}>
              Products
            </NavLink>
          </div>
          {['Industries', 'Standards', 'Company', 'Engineering'].map(link => (
            <NavLink key={link} accent={accent}>
              {link}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '8px', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8" cy="8" r="5.5"/>
              <line x1="12.5" y1="12.5" x2="16" y2="16"/>
            </svg>
          </button>
          <a href="#contact" style={{ textDecoration: 'none', padding: '8px 18px', borderRadius: 6, background: accent, color: '#FFFFFF', fontSize: 13, fontWeight: 600, transition: 'opacity 0.15s', display: 'inline-block' }}>
            Request Quote
          </a>
        </div>
      </div>

      {/* Megamenu */}
      {menuOpen && (
        <div
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
          style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', animation: 'fadeSlideDown 0.15s ease' }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48 }}>
            {MEGAMENU.map(col => (
              <div key={col.heading}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#64748B', textTransform: 'uppercase', marginBottom: 16 }}>{col.heading}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {col.items.map(item => (
                    <li key={item}>
                      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 400, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.target.style.color = accent}
                        onMouseLeave={e => e.target.style.color = '#475569'}
                      >
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }}></span>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
                <a href={col.highlight ? '#calculator' : '#'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 13, fontWeight: 600, color: accent, textDecoration: 'none' }}>
                  {col.cta}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '20px 0' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 10, border: '1px solid #CBD5E1' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#64748B" strokeWidth="1.8" style={{ position: 'absolute', left: 16 }}>
                <circle cx="8" cy="8" r="5.5"/><line x1="12.5" y1="12.5" x2="16" y2="16"/>
              </svg>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search part numbers, standards, cable types..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '14px 16px 14px 48px', color: '#0F172A', fontSize: 15, fontFamily: 'inherit' }}
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '8px 16px', fontSize: 12 }}>ESC</button>
            </div>
            {filtered.length > 0 && (
              <div style={{ marginTop: 8, background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {['Product','Standard','Tool'].map(cat => {
                  const items = filtered.filter(s => s.cat === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <p style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#475569', textTransform: 'uppercase' }}>{cat === 'Tool' ? 'Engineering Tools' : cat + 's'}</p>
                      {items.map((s, i) => (
                        <a key={i} href={s.href || '#'} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: '#334155', textDecoration: 'none', fontSize: 14, borderTop: '1px solid #E2E8F0', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,23,42,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {s.text}
                        </a>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

Object.assign(window, { SiechemNav });
