/**
 * Converts three key Tech Support pages from scanned-image stacks into
 * searchable HTML tables (data transcribed from the original scans):
 *   - ts-awg-sqmm.html       → AWG ⇄ mm ⇄ mm² conversion (68 sizes)
 *   - ts-color-code.html     → colour codes with live swatches (178 codes)
 *   - ts-ptfe-comparison.html → PTFE/FEP/PFA/ETFE property comparison
 *
 * The original scans stay available in a collapsed <details> below each table.
 * Run:  node scripts/build-ts-tables.mjs
 */
import fs from 'node:fs';

/* ── shared page furniture ─────────────────────────────────────────── */

const SEARCH_BOX = (id, placeholder) => `      <div class="spec-search-wrap" style="max-width:460px;margin-bottom:14px;">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <input class="spec-search-input" type="text" placeholder="${placeholder}" autocomplete="off" spellcheck="false"
               oninput="tsFilter('${id}', this.value, this.parentElement.querySelector('.spec-search-count'))">
        <span class="spec-search-count"></span>
      </div>`;

const TABLE_CSS = `    .ts-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; }
    .ts-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .ts-table thead th {
      position: sticky; top: 0;
      background: var(--bg-soft); padding: 11px 14px; text-align: left;
      font-family: var(--mono); font-size: 11px; font-weight: 700;
      letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-faint);
      border-bottom: 1px solid var(--border); white-space: nowrap;
    }
    .ts-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); white-space: nowrap; }
    .ts-table tbody tr:last-child td { border-bottom: none; }
    .ts-table tbody tr:hover { background: var(--accent-soft); }
    .ts-table td:first-child { font-weight: 600; color: var(--text); }
    .ts-section-row td {
      background: var(--bg-soft); font-family: var(--mono); font-size: 11px;
      font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-2);
    }
    .ts-swatch {
      display: inline-block; width: 15px; height: 15px; border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.2); vertical-align: -3px; margin-right: 7px;
    }
    .ts-swatch-half { position: relative; overflow: hidden; }
    .ts-no-match { display: none; text-align: center; padding: 22px; font-size: 13px; color: var(--text-faint); font-family: var(--mono); }
    .ts-scans summary {
      cursor: pointer; font-size: 13.5px; font-weight: 700; color: var(--accent);
      padding: 12px 0; user-select: none;
    }
    .ts-scans img { width: 100%; height: auto; display: block; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 14px; }
    .ts-formula {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
      padding: 14px 18px; font-family: var(--mono); font-size: 14px; color: var(--text);
      margin: 10px 0 6px; overflow-x: auto; white-space: nowrap;
    }`;

const FILTER_JS = `  <script>
  function tsFilter(tableId, q, countEl) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr:not(.ts-section-row)');
    const term = q.trim().toLowerCase();
    let visible = 0;
    rows.forEach(r => {
      const show = !term || r.textContent.toLowerCase().includes(term);
      r.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    // hide section header rows that have no visible rows beneath them
    table.querySelectorAll('tbody tr.ts-section-row').forEach(sec => {
      let el = sec.nextElementSibling, any = false;
      while (el && !el.classList.contains('ts-section-row')) {
        if (el.style.display !== 'none') { any = true; break; }
        el = el.nextElementSibling;
      }
      sec.style.display = (!term || any) ? '' : 'none';
    });
    if (countEl) countEl.textContent = term ? visible + ' of ' + rows.length + ' rows' : rows.length + ' rows';
    const nm = table.parentElement.nextElementSibling;
    if (nm && nm.classList.contains('ts-no-match')) nm.style.display = (visible === 0 && term) ? 'block' : 'none';
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ts-table').forEach(t => {
      const wrap = t.closest('.ts-table-wrap');
      const count = wrap && wrap.previousElementSibling ? wrap.previousElementSibling.querySelector('.spec-search-count') : null;
      if (count) count.textContent = t.querySelectorAll('tbody tr:not(.ts-section-row)').length + ' rows';
    });
  });
  </script>`;

const scansDetails = (slug, count, label) => `      <details class="ts-scans" style="margin-top:28px;">
        <summary>View original scanned pages (${label})</summary>
        <div style="max-width:900px;">
${Array.from({ length: count }, (_, i) => `          <img src="assets/tech-support/${slug}-${i + 1}.jpg" alt="${label} — original page ${i + 1}" loading="lazy" />`).join('\n')}
        </div>
      </details>`;

/* ── 1. AWG ⇄ mm² ──────────────────────────────────────────────────── */

const AWG_ROWS = [
  ['40','0.0031','0.0799','0.0050'],['39','0.0035','0.0897','0.0063'],['38','0.0040','0.1007','0.0080'],
  ['37','0.0045','0.1131','0.0100'],['36','0.0050','0.1270','0.0127'],['35','0.0056','0.1426','0.0160'],
  ['34','0.0063','0.1601','0.0201'],['33','0.0071','0.1798','0.0254'],['32','0.0080','0.2019','0.0320'],
  ['31','0.0089','0.2268','0.0404'],['30','0.0100','0.2546','0.0509'],['29','0.0113','0.2859','0.0642'],
  ['28','0.0126','0.3211','0.0810'],['27','0.0142','0.3606','0.1021'],['26','0.0159','0.4049','0.1288'],
  ['25','0.0179','0.4547','0.1624'],['24','0.0201','0.5106','0.2047'],['23','0.0226','0.5733','0.2582'],
  ['22','0.0253','0.6438','0.3255'],['21','0.0285','0.7229','0.4105'],['20','0.0320','0.8118','0.5176'],
  ['19','0.0359','0.9116','0.6527'],['18','0.0403','1.0237','0.8231'],['17','0.0453','1.1495','1.0379'],
  ['16','0.0508','1.2908','1.3087'],['15','0.0571','1.4495','1.6503'],['14','0.0641','1.6277','2.0810'],
  ['13','0.0720','1.8278','2.6240'],['12','0.0808','2.0525','3.3089'],['11','0.0907','2.3048','4.1724'],
  ['10','0.1019','2.5882','5.2613'],['9','0.1144','2.9064','6.6344'],['8','0.1285','3.2636','8.3658'],
  ['7','0.1443','3.6649','10.5490'],['6','0.1620','4.1154','13.3021'],['5','0.1819','4.6213','16.7736'],
  ['4','0.2043','5.1894','21.1512'],['3','0.2294','5.8273','26.6711'],['2','0.2576','6.5437','33.6317'],
  ['1','0.2893','7.3481','42.4087'],['0 (1/0)','0.3249','8.2515','53.4764'],['00 (2/0)','0.365','9.27','67.4'],
  ['000 (3/0)','0.41','10.4','85'],['0000 (4/0)','0.46','11.7','107'],
  ['250MCM','0.5','12.70','126.7'],['300MCM','0.548','13.91','152.0'],['350MCM','0.592','15.03','177.3'],
  ['400MCM','0.632','16.06','202.7'],['450MCM','0.671','17.04','228.0'],['500MCM','0.707','17.96','253.4'],
  ['550MCM','0.742','18.84','278.7'],['600MCM','0.775','19.67','304.0'],['650MCM','0.806','20.48','329.4'],
  ['700MCM','0.837','21.25','354.7'],['750MCM','0.866','22.00','380.0'],['800MCM','0.894','22.72','405.4'],
  ['900MCM','0.949','24.10','456.0'],['1000MCM','1.000','25.40','506.7'],['1100MCM','1.049','26.64','557.4'],
  ['1200MCM','1.095','27.82','608.1'],['1250MCM','1.118','28.40','633.4'],['1300MCM','1.140','28.96','658.7'],
  ['1400MCM','1.183','30.05','709.4'],['1500MCM','1.225','31.11','760.1'],['1600MCM','1.265','32.13','810.7'],
  ['1700MCM','1.304','33.12','861.4'],['1800MCM','1.342','34.08','912.1'],['1900MCM','1.378','35.01','962.7'],
  ['2000MCM','1.414','35.92','1013.4']
];

const awgSection = `  <section class="section-padding">
    <div class="container">
      <div style="max-width:900px;margin:0 auto;">
        <p style="font-size:15px;line-height:1.75;color:var(--text-muted);margin-bottom:16px;">American Wire Gauge (AWG) is used for representation of the cross-sectional area of round, solid and stranded non-ferrous conductors. Usage of AWG is mostly practiced in the United States; all other countries express conductor dimensions in millimetres (mm). There are 44 commonly known AWG sizes from 4/0 to 40. There is an inverse relation between the physical size of the conductor and the AWG number — a smaller AWG corresponds to a larger conductor diameter.</p>
        <p style="font-size:15px;line-height:1.75;color:var(--text-muted);margin-bottom:16px;">Stranded conductors are represented as x/y, where x is the number of strands and y is the diameter of each strand — e.g. 7/0.533 is a 7-strand conductor with 0.533&nbsp;mm strands.</p>
        <h3 style="font-size:15px;font-weight:800;margin:20px 0 4px;">Conversion formulas</h3>
        <div class="ts-formula">d<sub>n</sub> = 0.127 × 92<sup>(36−n)/39</sup> mm &nbsp;&nbsp;— diameter of n-gauge wire in mm</div>
        <div class="ts-formula">A<sub>n</sub> = 0.012668 × 92<sup>(36−n)/19</sup> mm² &nbsp;&nbsp;— cross-sectional area of n-gauge wire</div>
        <div class="ts-formula">d<sub>in</sub> = 0.005092 × 92<sup>(36−n)/39</sup> inches &nbsp;&nbsp;— diameter of n-gauge wire in inches</div>
        <p style="font-size:13px;line-height:1.65;color:var(--text-faint);margin:8px 0 26px;">Note: for sizes 1/0 to 2000MCM the formulas above are not applicable — use the table values.</p>

        <h3 style="font-size:15px;font-weight:800;margin:0 0 12px;">Conversion table</h3>
${SEARCH_BOX('awgTable', 'Search by AWG, mm, mm²…')}
        <div class="ts-table-wrap">
          <table class="ts-table" id="awgTable">
            <thead><tr><th>AWG / kcmil</th><th>Diameter (inches)</th><th>Diameter (mm)</th><th>Cross Section (mm²)</th></tr></thead>
            <tbody>
${AWG_ROWS.map(r => `              <tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('\n')}
            </tbody>
          </table>
        </div>
        <div class="ts-no-match">No sizes match your search</div>
${scansDetails('awg-sqmm', 4, 'AWG to Square mm Conversion')}
      </div>
    </div>
  </section>`;

/* ── 2. Colour codes ───────────────────────────────────────────────── */

const SWATCH = {
  'Red':'#DC2626','Yellow':'#FACC15','Blue':'#2563EB','Black':'#111827','Green':'#16A34A',
  'Grey':'#9CA3AF','Brown':'#92400E','White':'#FFFFFF','Orange':'#F97316','Violet':'#7C3AED',
  'Chocolate':'#5B3A29','Beige':'#D9C7A7','Charcoal':'#374151','LT Blue':'#7DD3FC','Dk Grey':'#4B5563',
  'LT Green':'#86EFAC','DK Green':'#14532D','DK Blue':'#1E3A8A','Purple':'#6B21A8','Pink':'#EC4899',
  'Transparent':'transparent','Turquoise':'#14B8A6','DK Violet':'#4C1D95','LT Violet':'#C4B5FD',
  'Dark Green':'#14532D','beige':'#D9C7A7'
};
function swatch1(name) {
  const c = SWATCH[name];
  if (c === undefined) return '';
  const style = c === 'transparent'
    ? 'background:repeating-conic-gradient(#E5E7EB 0% 25%, #fff 0% 50%) 0/8px 8px;'
    : 'background:' + c + ';';
  return `<span class="ts-swatch" style="${style}"></span>`;
}
function swatch2(name) {
  const parts = name.split('/').map(s => s.trim());
  if (parts.length !== 2) return swatch1(name);
  const a = SWATCH[parts[0]], b = SWATCH[parts[1]];
  if (a === undefined || b === undefined) return '';
  return `<span class="ts-swatch" style="background:linear-gradient(135deg, ${a} 50%, ${b} 50%);"></span>`;
}

const SINGLE = [
  ['1','Red','01'],['2','Yellow','02'],['3','Blue','03'],['4','Black','04'],['5','Green','05'],
  ['6','Grey','07'],['7','Brown','08'],['8','White','09'],['9','Orange','10'],['10','Violet','11'],
  ['11','Chocolate','12'],['12','Beige','A64'],['13','Charcoal','14'],['14','LT Blue','15'],
  ['15','Dk Grey','16'],['16','LT Green','17'],['17','DK Green','18'],['18','DK Blue','19'],
  ['19','Purple','20'],['20','Pink','21'],['21','Transparent','22'],['22','Turquoise','23']
];
const DOUBLE = [
  ['23','Yellow/Green','06'],['24','Red/Black','24'],['25','Red/Orange','25'],['26','Yellow/Blue','26'],
  ['27','Yellow/Pink','27'],['28','Yellow/White','28'],['29','Green/Yellow','29'],['30','Blue/Black','30'],
  ['31','Blue/Red','31'],['32','Blue/Yellow','32'],['33','Blue/Green','33'],['34','Black/Beige','34'],
  ['35','Black/Brown','35'],['36','Black/Blue','36'],['37','Black/Green','37'],['38','Black/Orange','38'],
  ['39','Black/Red','39'],['40','Black/White','40'],['41','Black/Yellow','41'],['42','Green/Black','42'],
  ['43','Green/Red','43'],['44','Green/Grey','44'],['45','Green/Brown','45'],['46','Grey/White','46'],
  ['47','Grey/Red','47'],['48','Grey/Violet','48'],['49','Grey/Black','49'],['50','Grey/Blue','50'],
  ['51','Grey/Green','51'],['52','Brown/Blue','52'],['53','Brown/Grey','53'],['54','Brown/Red','54'],
  ['55','Brown/Orange','55'],['56','Brown/Black','56'],['57','Brown/Yellow','57'],['58','Brown/White','58'],
  ['59','Brown/Green','59'],['60','White/Orange','60'],['61','White/Beige','61'],['62','White/Black','62'],
  ['63','White/Brown','63'],['64','White/Blue','64'],['65','White/Grey','65'],['66','White/Red','66'],
  ['67','Orange/Black','67'],['68','Orange/Grey','68'],['69','Orange/Brown','69'],['70','Orange/Blue','70'],
  ['71','Orange/Green','71'],['72','Orange/Red','72'],['73','Orange/White','73'],['74','Violet/Beige','74'],
  ['75','Violet/Grey','75'],['76','Violet/Blue','76'],['77','Violet/Green','77'],['78','Violet/Orange','78'],
  ['79','Pink/Black','79'],['80','Pink/Blue','80'],['81','Pink/Orange','81'],['82','Pink/Red','82'],
  ['83','Pink/White','83'],['84','Beige/White','84'],['85','Beige/Black','85'],['86','Beige/Blue','86'],
  ['87','Beige/Green','87'],['88','Beige/Grey','88'],['89','Beige/Orange','89'],['90','Beige/Pink','90'],
  ['91','Beige/Red','91'],['92','Beige/Yellow','92'],['93','Red/Green','93'],['94','Red/Yellow','94'],
  ['95','Yellow/Red','95'],['96','Yellow/Black','96'],['97','Yellow/Brown','97'],['98','Yellow/Orange','98'],
  ['99','Yellow/Violet','99'],['100','Blue/Brown','A01'],['101','Blue/White','A02'],['102','Green/Blue','A03'],
  ['103','Green/White','A04'],['104','Grey/Yellow','A05'],['105','White/Violet','A06'],['106','White/Green','A07'],
  ['107','White/Yellow','A08'],['108','Violet/Red','A09'],['109','Violet/Yellow','A10'],['110','Violet/White','A11'],
  ['111','Red/White','A12'],['112','Green/Orange','A13'],['113','Blue/Orange','A14'],['114','Pink/Yellow','A15'],
  ['115','Black/Grey','A16'],['116','Red/Blue','A17'],['117','Red/Grey','A18'],['118','Red/Pink','A19'],
  ['119','Pink/Green','A20'],['120','Orange/Violet','A21'],['121','Red/Violet','A22'],['122','Violet/Pink','A23'],
  ['123','Pink/Brown','A24'],['124','Red/Brown','A25'],['125','Grey/Orange','A26'],['126','Orange/Yellow','A27'],
  ['127','Green/Pink','A28'],['128','DK Blue/Black','A29'],['129','Grey/DK Blue','A30'],['130','LT Blue/DK Violet','A31'],
  ['131','LT Blue/Yellow','A32'],['132','LT Blue/LT Violet','A33'],['133','Blue/Grey','A34'],['134','Green/Violet','A35'],
  ['135','LT Green/Pink','A36'],['136','Grey/Pink','A37'],['137','Blue/Pink','A38'],['138','Grey/Brown','A39'],
  ['139','Brown/Violet','A40'],['140','Pink/Violet','A41'],['141','Violet/Black','A42'],['142','Yellow/Grey','A43'],
  ['143','LT Green/Red','A44'],['144','Pink/LT Green','A45'],['145','Green/LT Green','A46'],['146','Green/LT Blue','A47'],
  ['147','Grey/LT Blue','A48'],['148','White/LT Blue','A49'],['149','Violet/Brown','A50'],['150','Violet/LT Blue','A51'],
  ['151','LT Blue/White','A52'],['152','Violet/LT Green','A53'],['153','LT Blue/Orange','A54'],['154','White/LT Green','A55'],
  ['155','LT Blue/Brown','A56'],['156','Black/LT Blue','A57'],['157','LT Blue/Violet','A58'],['158','LT Green/LT Blue','A59'],
  ['159','Blue/LT Blue','A60'],['160','Red/LT Blue','A61'],['161','Brown/Beige','A62'],['162','Green/Beige','A63'],
  ['163','LT Green/White','A65'],['164','Blue/Beige','A66'],['165','Blue/LT Green','A67'],['166','Blue/Violet','A68'],
  ['167','Brown/LT Blue','A69'],['168','LT Green/Green','A70'],['169','Brown/LT Green','A71'],['170','LT Green/Grey','A72'],
  ['171','Yellow/Beige','A73'],['172','Pink/LT Blue','A74'],['173','Beige/LT Green','A75'],['174','Pink/Grey','A76'],
  ['175','Red/LT Green','A77'],['176','Black/Violet','A78'],['177','LT Green/Dark Green','A79'],['178','White/Pink','A80']
];

const colorSection = `  <section class="section-padding">
    <div class="container">
      <div style="max-width:900px;margin:0 auto;">
        <p style="font-size:15px;line-height:1.75;color:var(--text-muted);margin-bottom:22px;">Siechem insulation colour codes for single and double colour wires. The two-digit code forms part of the part number (e.g. the XX suffix in catalogue part numbers).</p>
${SEARCH_BOX('colorTable', 'Search by colour name or code…')}
        <div class="ts-table-wrap">
          <table class="ts-table" id="colorTable">
            <thead><tr><th>Sl. No</th><th>Colour</th><th>Code</th></tr></thead>
            <tbody>
              <tr class="ts-section-row"><td colspan="3">Single Colour</td></tr>
${SINGLE.map(r => `              <tr><td>${r[0]}</td><td>${swatch1(r[1])}${r[1]}</td><td>${r[2]}</td></tr>`).join('\n')}
              <tr class="ts-section-row"><td colspan="3">Double Colour</td></tr>
${DOUBLE.map(r => `              <tr><td>${r[0]}</td><td>${swatch2(r[1])}${r[1]}</td><td>${r[2]}</td></tr>`).join('\n')}
            </tbody>
          </table>
        </div>
        <div class="ts-no-match">No colours match your search</div>
${scansDetails('color-code', 4, 'Color Code Charts')}
      </div>
    </div>
  </section>`;

/* ── 3. PTFE / FEP / PFA / ETFE comparison ─────────────────────────── */

const PTFE_ROWS = [
  ['@MECHANICAL PROPERTIES'],
  ['Specific Gravity','D792','2.13–2.20','2.12–2.17','2.12–2.17','1.70–1.76'],
  ['Elongation %','D638','200–450','250–330','280–400','420–460'],
  ['Tensile Strength (psi)','D638','2000–4500','2800–5000','4000–4500','6100–6800'],
  ['Flexural Strength (psi)','D790','no break','no break','no break','5500'],
  ['Compressive Strength (psi)','D695','3500','2200','—','2500'],
  ["Tensile Elastic Modulus (Young's) (psi)",'D638','57,000','50,000','72,500–87,000','85,000–95,000'],
  ['Flexural Modulus (psi)','D790','71,000–85,000','78,000–92,000','94,000–99,000','128,000–171,000'],
  ['Flexural Modulus 10³MPa (10³kgf/cm²)','D790','0.5–0.6 (5.0–6.0)','0.5–0.6 (5.5–6.5)','0.6–0.7 (6.6–7.0)','0.9–1.4 (9.0–14.0)'],
  ['Flex Life (MIT cycles)','D2176','&gt;1,000,000','5,000–80,000','10,000–500,000','10,000–27,000'],
  ['Hardness Durometer Shore D','D636','50–65','55','55–60','75'],
  ['Coefficient of Friction','(on steel)','0.02','0.05','0.2','0.06'],
  ['Abrasion Resistance (1000 revs.)','Taber','12','14–20','9–17','na'],
  ['Impact Strength IZOD (73°F/23°C notched ft·lbs/in)','D256','3','no break','no break','no break'],
  ['@THERMAL PROPERTIES'],
  ['Melting Point','°C (°F)','327 (621)','260 (500)','305 (582)','267 (512)'],
  ['Upper Service Temperature (20000h)','°C (°F)','260 (500)','204 (400)','260 (500)','176 (348)'],
  ['Flammability','UL 94','V-0','V-0','V-0','V-0'],
  ['Thermal Conductivity (BTU/hr/sq ft/°F·in)','','1.7','1.4','1.3','1.65'],
  ['Thermal Conductivity (Cal-cm/s-cm², °C)','','6 × 10⁻⁴','6 × 10⁻⁴','6 × 10⁻⁶','5.7 × 10⁻⁴'],
  ['Linear Coefficient of Thermal Expansion','D696 · 10⁻⁵/°C','&gt;11.6','8.3–10.5','13','13'],
  ['Heat of Fusion','BTU/LB','29–37','11','13','20'],
  ['Heat of Combustion','BTU/LB','2200','2200','2300','8100'],
  ['Low Temperature Embrittlement','°C (°F)','−268 (−450)','−268 (−450)','−268 (−450)','−100 (−148)'],
  ['@ELECTRICAL PROPERTIES'],
  ['Dielectric Constant','D150 / 10³Hz','2.1','2.1','2.1','2.6'],
  ['Dielectric Constant','D150 / 10⁶Hz','2.1','2.1','2.1','2.6'],
  ['Dielectric Strength','D149 / 125 MIL','500','500','500','na'],
  ['Dielectric Strength','D149 / 10 MIL','≥1400','≥1400','≥1400','1600'],
  ['Volume Resistivity','D257 / ohm-cm','&gt;10¹⁸','&gt;10¹⁸','&gt;10¹⁸','&gt;10¹⁶'],
  ['Surface Resistivity','D257 / ohm-cm','&gt;10¹⁷','&gt;10¹⁷','&gt;10¹⁷','&gt;10¹⁵'],
  ['@GENERAL PROPERTIES'],
  ['Chemical / Solvent Resistance','D543','Excellent','Excellent','Excellent','Excellent'],
  ['Water Absorption 24h, %','D570','&lt;0.01','&lt;0.01','&lt;0.03','&lt;0.03'],
  ['Deformation Under Load','*D621 100°C','5','5','2.4','5.4'],
  ['Deformation Under Load','**D621 25°C','7','3','2.7','2.3'],
  ['Refractive Index','','1.35','1.338','1.34','1.4'],
  ['Arc Resistivity, %','','&gt;300','&gt;300','&gt;300','75'],
  ['Arc Resistance, sec','D495','&gt;200','&gt;300','&gt;300','122'],
  ['Limiting Oxygen Index, %','D2863','&gt;95','&gt;95','&gt;95','31']
];

const ptfeSection = `  <section class="section-padding">
    <div class="container">
      <div style="max-width:1000px;margin:0 auto;">
        <p style="font-size:15px;line-height:1.75;color:var(--text-muted);margin-bottom:22px;">Mechanical, thermal, electrical and general property comparison of the four fluoropolymer insulation materials — PTFE, FEP, PFA and ETFE.</p>
${SEARCH_BOX('ptfeTable', 'Search by property, ASTM, value…')}
        <div class="ts-table-wrap">
          <table class="ts-table" id="ptfeTable">
            <thead><tr><th>Property</th><th>ASTM / Unit</th><th>PTFE</th><th>FEP</th><th>PFA</th><th>ETFE</th></tr></thead>
            <tbody>
${PTFE_ROWS.map(r => r[0].startsWith('@')
  ? `              <tr class="ts-section-row"><td colspan="6">${r[0].slice(1)}</td></tr>`
  : `              <tr><td style="white-space:normal;min-width:210px;">${r[0]}</td><td>${r[1] || '—'}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td></tr>`).join('\n')}
            </tbody>
          </table>
        </div>
        <div class="ts-no-match">No properties match your search</div>
${scansDetails('ptfe-comparison', 2, 'Comparison Chart of PTFE, FEP, PFA, ETFE')}
      </div>
    </div>
  </section>`;

/* ── apply ─────────────────────────────────────────────────────────── */

const PAGES = {
  'ts-awg-sqmm.html': awgSection,
  'ts-color-code.html': colorSection,
  'ts-ptfe-comparison.html': ptfeSection
};

// The scan-stack section injected by fill-tech-support-pages.mjs:
const scanSectionRe = /  <section class="section-padding">\r?\n\s*<div class="container">\r?\n\s*<div style="max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:18px;">[\s\S]*?<\/section>/;

for (const [file, section] of Object.entries(PAGES)) {
  let s = fs.readFileSync(file, 'utf8');
  if (!scanSectionRe.test(s)) { console.log('SCAN SECTION NOT FOUND:', file); continue; }
  s = s.replace(scanSectionRe, section);
  // inject table CSS into the page's <style> block (before its closing tag)
  if (!s.includes('.ts-table-wrap')) {
    s = s.replace(/(\r?\n\s*)<\/style>/, `$1${TABLE_CSS}$1</style>`);
  }
  // inject filter JS before nav-mobile include
  if (!s.includes('function tsFilter')) {
    s = s.replace(/(\s*)<script src="animations\.js"><\/script>/, `$1${FILTER_JS}$1<script src="animations.js"></script>`);
  }
  fs.writeFileSync(file, s);
  console.log('converted:', file);
}
