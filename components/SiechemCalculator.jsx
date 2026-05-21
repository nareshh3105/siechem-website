const { useState, useCallback } = React;

const AWG_TABLE = {
  '30': { d_mm: 0.255, area: 0.0509, r_cu: 338.6, r_al: 555.5, amp: 0.5 },
  '28': { d_mm: 0.321, area: 0.0804, r_cu: 212.9, r_al: 349.5, amp: 0.8 },
  '26': { d_mm: 0.405, area: 0.1288, r_cu: 133.9, r_al: 219.7, amp: 1.3 },
  '24': { d_mm: 0.511, area: 0.2047, r_cu:  84.22, r_al: 138.2, amp: 2.1 },
  '22': { d_mm: 0.644, area: 0.3247, r_cu:  53.46, r_al:  87.7, amp: 3.3 },
  '20': { d_mm: 0.812, area: 0.5176, r_cu:  33.56, r_al:  55.1, amp: 5.3 },
  '18': { d_mm: 1.024, area: 0.8231, r_cu:  21.14, r_al:  34.7, amp: 7.5 },
  '16': { d_mm: 1.291, area:  1.307, r_cu:  13.30, r_al:  21.8, amp:  13 },
  '14': { d_mm: 1.628, area:  2.081, r_cu:  8.452, r_al:  13.9, amp:  18 },
  '12': { d_mm: 2.053, area:  3.309, r_cu:  5.315, r_al:  8.73, amp:  25 },
  '10': { d_mm: 2.588, area:  5.261, r_cu:  3.338, r_al:  5.47, amp:  35 },
  '8':  { d_mm: 3.264, area:  8.367, r_cu:  2.099, r_al:  3.45, amp:  46 },
  '6':  { d_mm: 4.115, area:  13.30, r_cu:  1.320, r_al:  2.17, amp:  65 },
  '4':  { d_mm: 5.189, area:  21.15, r_cu:  0.829, r_al:  1.36, amp:  85 },
  '2':  { d_mm: 6.544, area:  33.62, r_cu:  0.521, r_al: 0.856, amp: 115 },
  '1':  { d_mm: 7.348, area:  42.41, r_cu:  0.413, r_al: 0.678, amp: 130 },
  '1/0':{ d_mm: 8.252, area:  53.49, r_cu:  0.327, r_al: 0.537, amp: 150 },
  '2/0':{ d_mm: 9.266, area:  67.43, r_cu:  0.260, r_al: 0.426, amp: 175 },
  '3/0':{ d_mm: 10.40, area:  85.01, r_cu:  0.206, r_al: 0.338, amp: 200 },
  '4/0':{ d_mm: 11.68, area:  107.2, r_cu:  0.163, r_al: 0.268, amp: 230 },
};

const CABLE_SIZES = [0.5,0.75,1.0,1.5,2.5,4.0,6.0,10,16,25,35,50,70,95,120,150,185,240,300];

const ResultCard = ({ label, value, unit, sub, accent }) => (
  <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '18px 20px', border: '1px solid #E2E8F0', flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
      {value} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>{unit}</span>
    </p>
    {sub && <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{sub}</p>}
  </div>
);

function AWGTab({ accent }) {
  const [awg, setAwg] = useState('22');
  const [mat, setMat] = useState('cu');
  const d = AWG_TABLE[awg];
  const res = mat === 'cu' ? d.r_cu : d.r_al;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 200px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>AWG Gauge</label>
          <select value={awg} onChange={e => setAwg(e.target.value)} style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, padding: '12px 14px', color: '#0F172A', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
            {Object.keys(AWG_TABLE).map(g => <option key={g} value={g} style={{ background: '#FFFFFF', color: '#0F172A' }}>AWG {g}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 0 200px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Material</label>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #CBD5E1' }}>
            {[['cu','Copper'],['al','Aluminium']].map(([v,l]) => (
              <button key={v} onClick={() => setMat(v)} style={{ flex: 1, padding: '12px', background: mat === v ? accent : '#FFFFFF', color: mat === v ? '#FFFFFF' : '#475569', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <ResultCard label="Diameter" value={d.d_mm.toFixed(3)} unit="mm" sub={`${(d.d_mm / 25.4).toFixed(4)} inches`} accent={accent}/>
        <ResultCard label="Cross-Section" value={d.area < 1 ? d.area.toFixed(4) : d.area.toFixed(2)} unit="mm²" sub={`${(d.area * 1.9735).toFixed(3)} kcmil`} accent={accent}/>
        <ResultCard label={`Resistance (${mat === 'cu' ? 'Cu' : 'Al'})`} value={res.toFixed(2)} unit="Ω/km" sub="at 20°C" accent={accent}/>
        <ResultCard label="Ampacity" value={d.amp} unit="A" sub="~60°C free air" accent={accent}/>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 8, padding: '14px 18px', fontSize: 13, color: '#475569', borderLeft: `3px solid ${accent}`, borderTop: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <strong style={{ color: '#0F172A' }}>IEC equivalent: </strong>
        {d.area < 0.5 ? 'Custom' : d.area < 0.8 ? '0.5 mm²' : d.area < 1.2 ? '0.75–1.0 mm²' : d.area < 2 ? '1.5 mm²' : d.area < 3 ? '2.5 mm²' : d.area < 5 ? '4.0 mm²' : d.area < 8 ? '6.0 mm²' : d.area < 12 ? '10 mm²' : d.area < 22 ? '16–25 mm²' : d.area < 40 ? '35 mm²' : d.area < 60 ? '50 mm²' : '70+ mm²'}
        &nbsp;·&nbsp; Part of Siechem's stock range.
      </div>
    </div>
  );
}

function VoltageDropTab({ accent }) {
  const [voltage, setVoltage] = useState(230);
  const [current, setCurrent] = useState(10);
  const [length, setLength] = useState(25);
  const [section, setSection] = useState(2.5);
  const [mat, setMat] = useState('cu');

  const rho = mat === 'cu' ? 0.0172 : 0.0282;
  const vd = (2 * current * rho * length) / section;
  const pct = (vd / voltage) * 100;
  const ok = pct <= 5;
  const excellent = pct <= 3;

  const Field = ({ label, value, onChange, unit, min, max, step }) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, overflow: 'hidden' }}>
        <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value)||0)} min={min} max={max} step={step||1}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '12px 14px', color: '#0F172A', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', width: '80px' }}/>
        <span style={{ padding: '0 14px', color: '#64748B', fontSize: 13, borderLeft: '1px solid #CBD5E1' }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 14 }}>
        <Field label="System Voltage" value={voltage} onChange={setVoltage} unit="V" min={1} max={33000}/>
        <Field label="Current" value={current} onChange={setCurrent} unit="A" min={0.1} max={1000} step={0.1}/>
        <Field label="Cable Length" value={length} onChange={setLength} unit="m" min={1} max={10000}/>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Section</label>
          <select value={section} onChange={e => setSection(parseFloat(e.target.value))} style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, padding: '12px 14px', color: '#0F172A', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', outline: 'none' }}>
            {CABLE_SIZES.map(s => <option key={s} value={s} style={{ background: '#FFFFFF', color: '#0F172A' }}>{s} mm²</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 auto' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Conductor</label>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #CBD5E1' }}>
            {[['cu','Copper'],['al','Aluminium']].map(([v,l]) => (
              <button key={v} onClick={() => setMat(v)} style={{ padding: '10px 20px', background: mat===v ? accent : '#FFFFFF', color: mat===v ? '#FFF' : '#475569', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div style={{ background: ok ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)', border: `1px solid ${ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`, borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: 6 }}>Voltage Drop</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', letterSpacing: '-1px' }}>{vd.toFixed(2)} <span style={{ fontSize: 16, color: '#64748B', fontWeight: 500 }}>V</span></p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: 6 }}>% Drop</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: excellent ? '#10B981' : ok ? '#F59E0B' : '#EF4444', letterSpacing: '-1px' }}>{pct.toFixed(2)}<span style={{ fontSize: 16, fontWeight: 500 }}>%</span></p>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: excellent ? 'rgba(16,185,129,0.08)' : ok ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{excellent ? '✓' : ok ? '⚠' : '✗'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: excellent ? '#10B981' : ok ? '#F59E0B' : '#EF4444' }}>
                {excellent ? 'Excellent — within all limits' : ok ? 'Acceptable for power circuits' : 'Exceeds 5% limit — increase section'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#64748B' }}>IEC/BS limits: ≤3% lighting · ≤5% power</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReferenceTab({ accent }) {
  const rows = ['30','28','26','24','22','20','18','16','14','12','10','8','6','4','2'];
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
            {['AWG','Diameter (mm)','Area (mm²)','Cu Resist. (Ω/km)','Al Resist. (Ω/km)','Ampacity (A)'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((g, i) => {
            const d = AWG_TABLE[g];
            return (
              <tr key={g} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? '#F8FAFC' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${accent}15`}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#F8FAFC' : 'none'}
              >
                <td style={{ padding: '9px 14px', fontWeight: 700, color: accent }}>{g}</td>
                <td style={{ padding: '9px 14px', color: '#334155' }}>{d.d_mm}</td>
                <td style={{ padding: '9px 14px', color: '#334155' }}>{d.area}</td>
                <td style={{ padding: '9px 14px', color: '#334155' }}>{d.r_cu}</td>
                <td style={{ padding: '9px 14px', color: '#475569' }}>{d.r_al}</td>
                <td style={{ padding: '9px 14px', color: '#475569' }}>{d.amp}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { id: 'awg', label: 'AWG Converter', sub: 'Gauge → mm² / Ω / A' },
  { id: 'voltage', label: 'Voltage Drop', sub: 'IEC/BS compliance check' },
  { id: 'ref', label: 'Quick Reference', sub: 'AWG lookup table' },
];

function SiechemCalculator({ accent }) {
  const [tab, setTab] = useState('awg');

  return (
    <section id="calculator" style={{ background: '#FFFFFF', padding: '100px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>Engineering Desk</p>
            <h2 style={{ fontSize: 'clamp(28px,3vw,44px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
              Technical Calculators
            </h2>
            <p style={{ fontSize: 15, color: '#475569', marginTop: 12, maxWidth: 440 }}>Precision tools for cable selection, sizing and compliance verification — used by engineers worldwide.</p>
          </div>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', border: '1px solid #CBD5E1', borderRadius: 8, color: '#475569', textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Full Tool Suite
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M6.5 2l4.5 4.5L6.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </a>
        </div>

        {/* Tab strip */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t.id ? accent : 'none', color: tab === t.id ? '#FFFFFF' : '#475569', transition: 'all 0.15s', textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>{t.sub}</div>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          {tab === 'awg' && <AWGTab accent={accent}/>}
          {tab === 'voltage' && <VoltageDropTab accent={accent}/>}
          {tab === 'ref' && <ReferenceTab accent={accent}/>}
        </div>

        {/* Bottom note */}
        <p style={{ marginTop: 20, fontSize: 12, color: '#64748B', textAlign: 'center' }}>
          All calculations are indicative. Always validate against applicable wiring standards and project specifications. Values at 20°C unless otherwise stated.
        </p>
      </div>
    </section>
  );
}

Object.assign(window, { SiechemCalculator });
