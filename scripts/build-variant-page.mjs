/**
 * Assembles product-variant.html — a standalone page showing one product
 * variant's full spec sheet (previously a modal on product-family.html).
 *
 * Reuses product-family.html's head/nav/footer/quote-modal chunks so the two
 * pages stay visually identical, and adds its own hero + spec body driven by
 * ?f=<family-id>&s=<series-index>.
 *
 * Run:  node scripts/build-variant-page.mjs
 */
import fs from 'node:fs';

const src = fs.readFileSync('product-family.html', 'utf8').replace(/\r\n/g, '\n');

function cut(from, to) {
  const a = src.indexOf(from);
  const b = src.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error('Marker not found: ' + (a === -1 ? from : to));
  return src.slice(a, b);
}

/* A: doctype through just before the family hero (head, styles, nav, mobile drawer) */
let A = cut('<!DOCTYPE html>', '  <!-- Hero -->');
/* Tail: nav-mobile.js include → end of file */
const tail = src.slice(src.indexOf('  <script src="nav-mobile.js"'));

/* B: quote modal + footer, embedded directly since product-family.html no
   longer carries this markup (it was moved here when the spec sheet became
   its own page). */
const B = `  <!-- Quote Modal -->
  <div class="quote-overlay" id="quoteOverlay" onclick="handleQuoteOverlayClick(event)">
    <div class="quote-box" id="quoteBox">
      <h3>Request a Quote</h3>
      <p class="sub">Our sales team responds within 4 business hours.</p>
      <div class="q-success" id="qSuccess">
        <strong>Enquiry sent!</strong> Check your inbox for a confirmation with your quote reference.
      </div>
      <div class="q-error" id="qError"></div>
      <form id="quoteForm" onsubmit="submitQuote(event)">
        <input type="hidden" id="qPartNum" name="part_number">
        <input type="hidden" id="qCableType" name="cable_type">
        <input type="hidden" id="qCableSpec" name="cable_spec">
        <div class="form-row" style="margin-bottom:14px;">
          <div class="field">
            <label>Full Name *</label>
            <input type="text" name="name" required placeholder="Your name">
          </div>
          <div class="field">
            <label>Company</label>
            <input type="text" name="company" placeholder="Company name">
          </div>
        </div>
        <div class="form-row" style="margin-bottom:14px;">
          <div class="field">
            <label>Email *</label>
            <input type="email" name="email" required placeholder="you@company.com">
          </div>
          <div class="field">
            <label>Phone</label>
            <input type="tel" name="phone" placeholder="+91 …">
          </div>
        </div>
        <div class="form-row" style="margin-bottom:14px;">
          <div class="field">
            <label>Part Number</label>
            <input type="text" id="qPartDisplay" name="part_number_display" readonly style="background:var(--bg-soft);color:var(--text-muted);">
          </div>
          <div class="field">
            <label>Quantity (metres)</label>
            <input type="text" name="quantity" placeholder="e.g. 500 m">
          </div>
        </div>
        <div class="field" style="margin-bottom:14px;">
          <label>Required Delivery</label>
          <input type="text" name="delivery" placeholder="e.g. 4 weeks, urgent, flexible">
        </div>
        <div class="field" style="margin-bottom:4px;">
          <label>Additional Notes</label>
          <textarea name="message" placeholder="Conductor coating preference, colour, special requirements…"></textarea>
        </div>
        <div class="quote-actions">
          <button type="submit" class="btn btn-primary" id="qSubmitBtn">
            <span id="qBtnText">Send Enquiry</span>
          </button>
          <button type="button" class="btn btn-ghost" onclick="closeQuote()">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="siechem-redesign.html" class="nav-logo">
            <img src="assets/logo.jpg" alt="Siechem Wires &amp; Cables" class="logo-img" />
          </a>
          <p>India's leading specialty wires &amp; cables manufacturer since 2002.</p>
        </div>
        <div class="footer-col"><h4>Products</h4><ul>
          <li><a href="products.html">All Products</a></li>
          <li><a href="product-aero44.html">Aero 44</a></li>
          <li><a href="product-automotive.html">Automotive</a></li>
        </ul></div>
        <div class="footer-col"><h4>Engineering</h4><ul>
          <li><a href="tech-support.html">AWG Converter</a></li>
          <li><a href="tech-support.html">Voltage Drop</a></li>
          <li><a href="tech-support.html">All Tools</a></li>
        </ul></div>
        <div class="footer-col"><h4>Company</h4><ul>
          <li><a href="about.html">About</a></li>
          <li><a href="certifications.html">Certifications</a></li>
          <li><a href="customers.html">Customers</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul></div>
        <div class="footer-col"><h4>Contact</h4><ul>
          <li><a href="mailto:sales@siechem.com">sales@siechem.com</a></li>
          <li><a href="tel:+914425220859">+91 44 2522 0859</a></li>
          <li>Chennai · Pondicherry</li>
        </ul></div>
      </div>
      <div class="footer-meta">
        <span>© 2026 Siechem Technologies Pvt. Ltd.</span>
        <span>Established 2002 · AS9100 Certified</span>
      </div>
    </div>
  </footer>

`;

A = A
  .replace(/<title>[^<]*<\/title>/, '<title>Product Variant — Siechem Wires &amp; Cables</title>')
  .replace(/(<meta name="description" content=")[^"]*(">)/, '$1Full specification sheet and part-number table for a Siechem cable variant. Request a quote online.$2')
  .replace(/(<meta property="og:title" content=")[^"]*(">)/, '$1Siechem Product Variant$2')
  .replace(/(<meta property="og:description" content=")[^"]*(">)/, '$1Full spec sheet and part numbers — request a quote online.$2')
  .replace(/(<meta property="og:url" content="https:\/\/siechem\.vercel\.app\/)[^"]*(">)/, '$1product-variant.html$2')
  .replace(/(<link rel="canonical" href="https:\/\/siechem\.vercel\.app\/)[^"]*(">)/, '$1product-variant.html$2');

const mid = `  <!-- Hero -->
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb">
        <a href="siechem-redesign.html">Home</a><span class="breadcrumb-sep"></span>
        <a href="products.html">Products</a><span class="breadcrumb-sep"></span>
        <a href="product-family.html" id="bcFamily">Catalogue</a><span class="breadcrumb-sep"></span>
        <span id="bcVariant">Variant</span>
      </div>
      <div class="page-hero-content single">
        <div class="fade-up">
          <div class="eyebrow" id="ssCat"></div>
          <h1 class="page-title" id="ssTitle">Loading variant…</h1>
        </div>
      </div>
    </div>
  </section>

  <!-- Variant Spec Body -->
  <section class="section section-tight">
    <div class="container">
      <div class="spec-two-col" id="ssBody"></div>

      <h4 style="font-size:12px;font-weight:700;font-family:var(--mono);text-transform:uppercase;letter-spacing:0.1em;color:var(--text-faint);margin-bottom:10px;">Complete Size Range</h4>
      <div class="spec-search-wrap">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <input class="spec-search-input" id="specSearchInput" type="text" placeholder="Search by part no., size…" oninput="filterSpecTable(this.value)" autocomplete="off" spellcheck="false">
        <span class="spec-search-count" id="specSearchCount"></span>
      </div>
      <div class="spec-no-match" id="specNoMatch">No parts match your search</div>
      <div class="part-table-wrap"><table class="part-table" id="specPartTable"><thead id="ssThead"></thead><tbody id="ssTbody"></tbody></table></div>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" id="ssQuoteBtn">Request Quote for this Variant
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <a class="btn btn-ghost" id="ssBackBtn" href="product-family.html">Back to Catalogue</a>
      </div>
    </div>
  </section>

`;

/* CSS additions needed for the standalone page (spec-two-col etc. already ship
   inside product-family.html's <style>, which A already includes verbatim). */

const script = `  <script>
  /* ══════════════════════════════════════════════════
     PRODUCT VARIANT PAGE
     Loads catalog/data/products/<family>.json, finds one
     series by index, and renders its full spec sheet.
  ══════════════════════════════════════════════════ */
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(location.search);
  const FAMILY_ID = hashParams.get('f') || queryParams.get('f') || 'marine';
  const SERIES_IDX = parseInt(hashParams.get('s') || queryParams.get('s'), 10) || 0;
  let FAM = null, S = null;

  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  const DIMS = [
    { key: 'voltage', label: 'Voltage' },
    { key: 'cores', label: 'Cores' },
    { key: 'screen', label: 'Screening' },
    { key: 'armour', label: 'Armour' },
    { key: 'conductor', label: 'Conductor' },
    { key: 'insulation', label: 'Insulation' },
    { key: 'temp', label: 'Temp Rating' },
    { key: 'standard', label: 'Standard' }
  ];
  function normVolt(v) { return v.replace(/\\s+/g, '').replace(/KV/i, 'kV').replace(/v$/, 'V'); }
  const DIM_FNS = {
    voltage: n => {
      let m = n.match(/\\d+(?:\\.\\d+)?\\s*\\/\\s*\\d+(?:\\.\\d+)?\\s*kV/i);
      if (m) return normVolt(m[0]);
      m = n.match(/\\b\\d+(?:\\.\\d+)?\\s*kV\\b/i);
      if (m) return normVolt(m[0]);
      m = n.match(/\\b(\\d{3,4})\\s*\\/\\s*(\\d{3,4})\\s*V\\b/);
      if (m) return m[1] + '/' + m[2] + 'V';
      m = n.match(/\\b(\\d{3,4})\\s*V\\b/);
      return m ? m[1] + 'V' : null;
    },
    cores: n => {
      if (/multi\\s*core/i.test(n)) return 'Multicore';
      if (/single\\s*core|\\b1\\s*core/i.test(n)) return 'Single Core';
      if (/twisted\\s+twin|twin\\s*core|two\\s*core|\\b2\\s*core/i.test(n)) return '2 Core';
      if (/3\\.5\\s*core/i.test(n)) return '3.5 Core';
      if (/\\b(3|three)\\s*core/i.test(n)) return '3 Core';
      if (/\\b(4|four)\\s*core/i.test(n)) return '4 Core';
      if (/\\b(5|five)\\s*core/i.test(n)) return '5 Core';
      return null;
    },
    screen: n => /screen|shield|\\bemc\\b/i.test(n) ? 'Screened' : 'Unscreened',
    armour: n => {
      if (/unarmou?r/i.test(n)) return 'Unarmoured';
      if (/armou?r/i.test(n)) return 'Armoured';
      return null;
    },
    conductor: n => {
      if (/aluminium|aluminum/i.test(n)) return 'Aluminium';
      if (/tinned\\s+copper/i.test(n)) return 'Tinned Copper';
      if (/copper/i.test(n)) return 'Copper';
      return null;
    },
    insulation: n => {
      const mats = ['EBXL','XLPE','XLPO','PVC','Silicone','Rubber','FEP','PTFE','ETFE','EPR','LSZH','PUR','Fluoro'];
      for (const m of mats) if (new RegExp('\\\\b' + m, 'i').test(n)) return m === 'Fluoro' ? 'Fluoroelastomer' : m;
      return null;
    },
    temp: n => {
      const m = n.match(/\\b(70|85|90|105|110|120|125|150|155|180|200|250)\\s*(?:°|º|deg\\.?\\s*|o)?\\s*C\\b/i);
      return m ? m[1] + '°C' : null;
    },
    standard: n => {
      const m = n.match(/\\b(BS\\s?EN\\s?\\d+(?:-\\d+)?|EN\\s?\\d+(?:-\\d+)?|BS\\s?\\d+|IS\\s?\\d+|IEC\\s?\\d+|UL\\s?\\d+|JIS\\s?[A-Z]?\\s?\\d+|SAE\\s?[A-Z]*\\s?\\d+|MIL-[A-Z]+-?\\d+|EMD\\/[\\w.]+|H0[57][A-Z0-9-]+|RDSO[\\/\\w.-]*)\\b/i);
      if (!m) return null;
      return m[1].toUpperCase().replace(/\\s+/g, '').replace(/^BSEN/, 'BS EN').replace(/([A-Z])(\\d)/, '$1 $2');
    }
  };

  function cleanName(raw, i, famName) {
    let n = (raw || '')
      .replace(/A{2,}E{2,}R{2,}O{2,}\\s*\\d*/g, '')
      .replace(/Wires\\s*&\\s*Cables\\s*Meet\\s*EU\\s*RoHS\\s*Directive/ig, '')
      .replace(/Siechem/ig, '')
      .replace(/\\s+/g, ' ')
      .replace(/^[\\s\\-–—·,.]+|[\\s\\-–—·,.]+$/g, '')
      .trim();
    if (n.length < 8 || /^per conductor/i.test(n) || /^wires\\s*&?\\s*cables$/i.test(n)) {
      n = (famName ? famName.replace(/\\s*Wires\\s*&\\s*Cables.*$/i, '') : 'Series') + ' — Variant ' + (i + 1);
    }
    if (n.length > 150) n = n.slice(0, 147) + '…';
    return n;
  }

  async function init() {
    let fams, prod;
    try {
      [fams, prod] = await Promise.all([
        fetch('catalog/data/families.json').then(r => r.json()),
        fetch('catalog/data/products/' + FAMILY_ID + '.json').then(r => r.json())
      ]);
    } catch (e) {
      document.getElementById('ssTitle').textContent = 'Variant not found';
      return;
    }
    FAM = fams.families.find(f => f.id === FAMILY_ID) || { name: FAMILY_ID };
    const raw = prod.series[SERIES_IDX];
    if (!raw) {
      document.getElementById('ssTitle').textContent = 'Variant not found';
      return;
    }
    const display = cleanName(raw.name, SERIES_IDX, FAM.name);
    const scanText = (raw.name || '') + ' ' + display;
    const attrs = {};
    DIMS.forEach(d => attrs[d.key] = (DIM_FNS[d.key] || (() => null))(scanText));
    S = { ...raw, idx: SERIES_IDX, display, attrs };

    render();
  }

  function render() {
    document.title = S.display + ' — ' + FAM.name + ' — Siechem';
    document.getElementById('bcFamily').textContent = FAM.name;
    document.getElementById('bcFamily').href = 'product-family.html#f=' + FAMILY_ID;
    document.getElementById('bcVariant').textContent = S.display;
    document.getElementById('ssBackBtn').href = 'product-family.html#f=' + FAMILY_ID;

    document.getElementById('ssCat').textContent = FAM.name + (S.pages && S.pages.length ? ' · Catalogue p.' + S.pages.join('–') : '');
    document.getElementById('ssTitle').textContent = S.display;

    const attrRows = DIMS.filter(d => S.attrs[d.key])
      .map(d => '<div class="spec-kv-row"><span class="k">' + d.label + '</span><span class="v">' + esc(S.attrs[d.key]) + '</span></div>').join('');
    const famRows = [
      FAM.voltage ? ['Family voltage', FAM.voltage] : null,
      FAM.temp ? ['Family temp range', FAM.temp] : null
    ].filter(Boolean).map(([k, v]) => '<div class="spec-kv-row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>').join('');

    document.getElementById('ssBody').innerHTML =
      '<div class="spec-block"><h4>Variant Attributes</h4><div class="spec-kv">' + attrRows + famRows + '</div></div>' +
      '<div class="spec-block"><h4>Applicable Standards</h4><div class="standards-list">' +
      (FAM.standards || []).concat(S.attrs.standard ? [S.attrs.standard] : []).filter((v, i, a) => a.indexOf(v) === i).map(t => '<span class="std-chip">' + esc(t) + '</span>').join('') +
      '</div><h4 style="margin-top:16px;">Applications</h4><div class="spec-kv">' +
      (FAM.applications || []).slice(0, 4).map(a => '<div class="spec-kv-row"><span class="v">' + esc(a) + '</span></div>').join('') +
      '</div></div>';

    const headers = (S.headers && S.headers.length ? S.headers : ['Part Number']).map(h => h && h.trim() ? h : '—');
    document.getElementById('ssThead').innerHTML = '<tr>' + headers.map(h => '<th>' + esc(h) + '</th>').join('') + '<th></th></tr>';
    document.getElementById('ssTbody').innerHTML = S.rows.map(r => {
      const pn = (r[0] || '').toString().trim();
      return '<tr>' + headers.map((_, ci) => '<td>' + esc(r[ci] != null ? r[ci] : '') + '</td>').join('') +
        '<td><button class="quote-row-btn" onclick="openQuote(' + JSON.stringify(pn).replace(/"/g, '&quot;') + ')">Quote</button></td></tr>';
    }).join('');
    document.getElementById('specSearchCount').textContent = S.rows.length + ' parts';

    document.getElementById('ssQuoteBtn').addEventListener('click', () => openQuote('—'));
  }

  function filterSpecTable(q) {
    const rows = document.querySelectorAll('#specPartTable tbody tr');
    const noMatch = document.getElementById('specNoMatch');
    const countEl = document.getElementById('specSearchCount');
    const term = q.trim().toLowerCase();
    let visible = 0;
    rows.forEach(row => {
      const show = !term || row.textContent.toLowerCase().includes(term);
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    countEl.textContent = term ? visible + ' of ' + rows.length + ' parts' : rows.length + ' parts';
    noMatch.style.display = (visible === 0 && term) ? 'block' : 'none';
  }

  /* ── Quote Modal ────────────────────────────────── */
  function openQuote(partNum) {
    document.getElementById('qPartNum').value = partNum;
    document.getElementById('qCableType').value = S.display;
    document.getElementById('qCableSpec').value = JSON.stringify({
      label: S.display, family: FAM.name,
      spec: S.attrs.standard || (FAM.standards || [])[0] || '',
      voltageRating: S.attrs.voltage || FAM.voltage || '',
      temp: S.attrs.temp || FAM.temp || ''
    });
    document.getElementById('qPartDisplay').value = partNum;
    document.getElementById('qSuccess').style.display = 'none';
    document.getElementById('qError').style.display = 'none';
    document.getElementById('quoteForm').style.display = '';
    document.getElementById('qBtnText').textContent = 'Send Enquiry';
    document.getElementById('qSubmitBtn').disabled = false;
    document.getElementById('quoteOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeQuote() {
    document.getElementById('quoteOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
  function handleQuoteOverlayClick(e) {
    if (e.target === document.getElementById('quoteOverlay')) closeQuote();
  }
  async function submitQuote(e) {
    e.preventDefault();
    const btn = document.getElementById('qSubmitBtn');
    const btnText = document.getElementById('qBtnText');
    const errEl = document.getElementById('qError');
    btn.disabled = true; btnText.textContent = 'Sending…';
    errEl.style.display = 'none';
    const data = Object.fromEntries(new FormData(e.target));
    data.subject = (FAM ? FAM.name : 'Product') + ' Quote – ' + (data.part_number || data.cable_type);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        e.target.style.display = 'none';
        document.getElementById('qSuccess').style.display = 'block';
      } else throw new Error(json.message || 'Failed');
    } catch (err) {
      errEl.textContent = 'Could not send. Please email sales@siechem.com directly.';
      errEl.style.display = 'block';
      btn.disabled = false; btnText.textContent = 'Send Enquiry';
    }
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQuote(); });

  init();
  </script>

`;

const out = A + mid + B + script + tail;
fs.writeFileSync('product-variant.html', out);
console.log('product-variant.html written:', out.length, 'bytes');
