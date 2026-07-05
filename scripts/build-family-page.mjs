/**
 * Assembles product-family.html — the generic per-family catalogue page —
 * from product-aero44.html's shared chunks (head/styles/nav, modals/footer, tail)
 * plus a data-driven middle section and rendering engine.
 *
 * The page is driven by ?f=<family-id> and loads:
 *   catalog/data/families.json          (family metadata)
 *   catalog/data/products/<id>.json     (extracted series + part tables)
 *
 * Run:  node scripts/build-family-page.mjs
 */
import fs from 'node:fs';

const src = fs.readFileSync('product-aero44.html', 'utf8').replace(/\r\n/g, '\n');

function cut(from, to) {
  const a = src.indexOf(from);
  const b = src.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error('Marker not found: ' + (a === -1 ? from : to));
  return src.slice(a, b);
}

/* A: doctype → just before hero section (head, styles, nav, mobile drawer) */
let A = cut('<!DOCTYPE html>', '  <!-- Hero -->');
/* B: spec modal + quote modal + footer (ends where the big script starts) */
const B = cut('  <!-- Spec Sheet Modal -->', '  <script>\n  /* ═');
/* Tail: nav-mobile.js include → end of file */
const tail = src.slice(src.indexOf('  <script src="nav-mobile.js"'));

/* Generic head metadata */
A = A
  .replace(/<title>[^<]*<\/title>/, '<title>Product Catalogue — Siechem Wires &amp; Cables</title>')
  .replace(/(<meta name="description" content=")[^"]*(">)/, '$1Siechem specialty cable catalogue — browse variants, filter by specification and request a quote.$2')
  .replace(/(<meta property="og:title" content=")[^"]*(">)/, '$1Siechem Product Catalogue$2')
  .replace(/(<meta property="og:description" content=")[^"]*(">)/, '$1Browse Siechem cable variants and request quotes online.$2')
  .replace(/(<meta property="og:url" content="https:\/\/siechem\.vercel\.app\/)[^"]*(">)/, '$1product-family.html$2')
  .replace(/(<link rel="canonical" href="https:\/\/siechem\.vercel\.app\/)[^"]*(">)/, '$1product-family.html$2');

const mid = `  <!-- Hero -->
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb">
        <a href="siechem-redesign.html">Home</a><span class="breadcrumb-sep"></span>
        <a href="products.html">Products</a><span class="breadcrumb-sep"></span>
        <span id="bcName">Catalogue</span>
      </div>
      <div class="page-hero-content">
        <div class="fade-up">
          <div class="eyebrow" id="fSegment"></div>
          <h1 class="page-title" id="fTitle">Loading catalogue…</h1>
          <p class="page-lede" id="fSummary"></p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;" id="fStandards"></div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;" id="fDatasheets"></div>
        </div>
        <div class="fade-up fade-up-3" style="padding:24px;background:var(--bg-soft);border:1px solid var(--border);border-radius:14px;display:flex;flex-direction:column;gap:14px;" id="fQuickSpecs"></div>
      </div>
    </div>
  </section>

  <!-- Filter Strip (built per-family from the data) -->
  <section class="section section-tight">
    <div class="container">
      <div class="filter-strip reveal" id="filterStrip"></div>
      <div class="spec-search-wrap" style="margin-top:14px;max-width:420px;">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <input class="spec-search-input" id="seriesSearch" type="text" placeholder="Search variants by name, standard…" autocomplete="off" spellcheck="false">
      </div>
      <div class="result-count" id="resultCount"></div>
    </div>
  </section>

  <!-- Product Grid -->
  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="prod-grid" id="prodGrid"></div>
    </div>
  </section>

`;

const script = `  <script>
  /* ══════════════════════════════════════════════════
     GENERIC FAMILY CATALOGUE ENGINE
     Loads catalog/data/products/<family>.json and derives
     family-specific filter parameters from the series data.
  ══════════════════════════════════════════════════ */
  const FAMILY_ID = new URLSearchParams(location.search).get('f')
    || (location.hash.match(/f=([\\w-]+)/) || [])[1]
    || 'marine';
  window.addEventListener('hashchange', () => location.reload());
  let FAM = null;      // family metadata from families.json
  let SERIES = [];     // enriched series list
  let filters = {};    // active filter selections
  let searchTerm = '';

  /* ── Attribute extraction (per-family search parameters) ── */
  function normVolt(v) {
    return v.replace(/\\s+/g, '').replace(/KV/i, 'kV').replace(/v$/, 'V');
  }
  const DIMS = [
    { key: 'voltage', label: 'Voltage', fn: n => {
        let m = n.match(/\\d+(?:\\.\\d+)?\\s*\\/\\s*\\d+(?:\\.\\d+)?\\s*kV/i);
        if (m) return normVolt(m[0]);
        m = n.match(/\\b\\d+(?:\\.\\d+)?\\s*kV\\b/i);
        if (m) return normVolt(m[0]);
        m = n.match(/\\b(\\d{3,4})\\s*\\/\\s*(\\d{3,4})\\s*V\\b/);
        if (m) return m[1] + '/' + m[2] + 'V';
        m = n.match(/\\b(\\d{3,4})\\s*V\\b/);
        if (m) return m[1] + 'V';
        return null;
      } },
    { key: 'cores', label: 'Cores', fn: n => {
        if (/multi\\s*core/i.test(n)) return 'Multicore';
        if (/single\\s*core|\\b1\\s*core/i.test(n)) return 'Single Core';
        if (/twisted\\s+twin|twin\\s*core|two\\s*core|\\b2\\s*core/i.test(n)) return '2 Core';
        if (/3\\.5\\s*core/i.test(n)) return '3.5 Core';
        if (/\\b(3|three)\\s*core/i.test(n)) return '3 Core';
        if (/\\b(4|four)\\s*core/i.test(n)) return '4 Core';
        if (/\\b(5|five)\\s*core/i.test(n)) return '5 Core';
        return null;
      } },
    { key: 'screen', label: 'Screening', fn: n =>
        /screen|shield|\\bemc\\b/i.test(n) ? 'Screened' : 'Unscreened' },
    { key: 'armour', label: 'Armour', fn: n => {
        if (/unarmou?r/i.test(n)) return 'Unarmoured';
        if (/armou?r/i.test(n)) return 'Armoured';
        return null;
      } },
    { key: 'conductor', label: 'Conductor', fn: n => {
        if (/aluminium|aluminum/i.test(n)) return 'Aluminium';
        if (/tinned\\s+copper/i.test(n)) return 'Tinned Copper';
        if (/copper/i.test(n)) return 'Copper';
        return null;
      } },
    { key: 'insulation', label: 'Insulation', fn: n => {
        const mats = ['EBXL','XLPE','XLPO','PVC','Silicone','Rubber','FEP','PTFE','ETFE','EPR','LSZH','PUR','Fluoro'];
        for (const m of mats) if (new RegExp('\\\\b' + m, 'i').test(n)) return m === 'Fluoro' ? 'Fluoroelastomer' : m;
        return null;
      } },
    { key: 'temp', label: 'Temp Rating', fn: n => {
        const m = n.match(/\\b(70|85|90|105|110|120|125|150|155|180|200|250)\\s*(?:°|º|deg\\.?\\s*|o)?\\s*C\\b/i);
        return m ? m[1] + '°C' : null;
      } },
    { key: 'standard', label: 'Standard', fn: n => {
        const m = n.match(/\\b(BS\\s?EN\\s?\\d+(?:-\\d+)?|EN\\s?\\d+(?:-\\d+)?|BS\\s?\\d+|IS\\s?\\d+|IEC\\s?\\d+|UL\\s?\\d+|JIS\\s?[A-Z]?\\s?\\d+|SAE\\s?[A-Z]*\\s?\\d+|MIL-[A-Z]+-?\\d+|EMD\\/[\\w.]+|H0[57][A-Z0-9-]+|RDSO[\\/\\w.-]*)\\b/i);
        if (!m) return null;
        return m[1].toUpperCase().replace(/\\s+/g, '')
          .replace(/^BSEN/, 'BS EN')
          .replace(/([A-Z])(\\d)/, '$1 $2');
      } }
  ];

  function cleanName(raw, i) {
    let n = (raw || '')
      .replace(/A{2,}E{2,}R{2,}O{2,}\\s*\\d*/g, '')
      .replace(/Wires\\s*&\\s*Cables\\s*Meet\\s*EU\\s*RoHS\\s*Directive/ig, '')
      .replace(/Siechem/ig, '')
      .replace(/\\s+/g, ' ')
      .replace(/^[\\s\\-–—·,.]+|[\\s\\-–—·,.]+$/g, '')
      .trim();
    if (n.length < 8 || /^per conductor/i.test(n) || /^wires\\s*&?\\s*cables$/i.test(n)) {
      n = (FAM ? FAM.name.replace(/\\s*Wires\\s*&\\s*Cables.*$/i, '') : 'Series') + ' — Variant ' + (i + 1);
    }
    if (n.length > 150) n = n.slice(0, 147) + '…';
    return n;
  }

  /* ── Load data ──────────────────────────────────── */
  async function init() {
    let fams, prod;
    try {
      [fams, prod] = await Promise.all([
        fetch('catalog/data/families.json').then(r => r.json()),
        fetch('catalog/data/products/' + FAMILY_ID + '.json').then(r => r.json())
      ]);
    } catch (e) {
      document.getElementById('fTitle').textContent = 'Catalogue not found';
      document.getElementById('fSummary').textContent = 'The requested product family could not be loaded. Browse all products instead.';
      return;
    }
    FAM = fams.families.find(f => f.id === FAMILY_ID) || { name: FAMILY_ID, segment: '', summary: '' };

    SERIES = prod.series.map((s, i) => {
      const display = cleanName(s.name, i);
      const scanText = (s.name || '') + ' ' + display;
      const attrs = {};
      DIMS.forEach(d => attrs[d.key] = d.fn(scanText));
      return { ...s, idx: i, display, attrs };
    });

    renderHero();
    buildFilterStrip();
    applyFilters();
  }

  /* ── Hero ───────────────────────────────────────── */
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function renderHero() {
    document.title = FAM.name + ' — Siechem Wires & Cables';
    document.getElementById('bcName').textContent = FAM.name;
    document.getElementById('fSegment').textContent = FAM.segment || '';
    document.getElementById('fTitle').innerHTML = esc(FAM.name);
    document.getElementById('fSummary').textContent = FAM.summary || '';

    const stds = (FAM.standards || []).slice(0, 6);
    document.getElementById('fStandards').innerHTML =
      '<span class="tag tag-accent">' + SERIES.length + ' Variants</span>' +
      stds.map(s => '<span class="tag">' + esc(s) + '</span>').join('');

    document.getElementById('fDatasheets').innerHTML = (FAM.datasheets || []).map(d =>
      '<a class="btn btn-ghost" style="font-size:13px;" href="' + d.url + '" target="_blank" rel="noopener">' +
      '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 1v8M4 6l3 3 3-3M2 12h10"/></svg> Download Catalogue PDF</a>'
    ).join('');

    const qs = [];
    if (FAM.voltage) qs.push(['Voltage', FAM.voltage]);
    if (FAM.temp) qs.push(['Temp Rating', FAM.temp]);
    if (FAM.materials && FAM.materials.length) qs.push(['Insulation', FAM.materials.slice(0, 3).join(' / ')]);
    if (FAM.conductorMaterials && FAM.conductorMaterials.length) qs.push(['Conductor', FAM.conductorMaterials.slice(0, 2).join(' / ')]);
    if (FAM.sizeRange && FAM.sizeRange.length === 2) qs.push(['Size Range', FAM.sizeRange[0] + ' – ' + FAM.sizeRange[1] + ' mm²']);
    qs.push(['Product Variants', SERIES.length]);
    let html = '';
    for (let i = 0; i < qs.length; i += 2) {
      if (i) html += '<hr class="divider" style="margin:0;">';
      html += '<div style="display:flex;justify-content:space-between;gap:16px;">' +
        qs.slice(i, i + 2).map(([k, v]) =>
          '<div class="spec"><span class="spec-label">' + esc(k) + '</span><span class="spec-value" style="font-size:15px;">' + esc(v) + '</span></div>'
        ).join('') + '</div>';
    }
    document.getElementById('fQuickSpecs').innerHTML = html;
  }

  /* ── Filter strip (derived per family) ──────────── */
  let activeDims = [];
  function buildFilterStrip() {
    activeDims = DIMS.map(d => {
      const counts = {};
      SERIES.forEach(s => { const v = s.attrs[d.key]; if (v) counts[v] = (counts[v] || 0) + 1; });
      const vals = Object.keys(counts);
      return { ...d, vals, counts };
    }).filter(d => d.vals.length >= 2).slice(0, 6);

    activeDims.forEach(d => {
      if (d.key === 'voltage') {
        const vnum = v => parseFloat(v) * (/kV/i.test(v) ? 1000 : 1);
        d.vals.sort((a, b) => vnum(a) - vnum(b));
      } else d.vals.sort();
      filters[d.key] = 'all';
    });

    document.getElementById('filterStrip').innerHTML = activeDims.map(d =>
      '<div class="filter-group"><span class="filter-label">' + d.label + '</span><div class="filter-pills">' +
      '<button class="fpill active" data-f="' + d.key + '" data-v="all">All</button>' +
      d.vals.map(v => '<button class="fpill" data-f="' + d.key + '" data-v="' + esc(v) + '">' + esc(v) + ' <span style="opacity:.55;">(' + d.counts[v] + ')</span></button>').join('') +
      '</div></div>'
    ).join('');

    document.querySelectorAll('.fpill').forEach(btn => {
      btn.addEventListener('click', () => {
        filters[btn.dataset.f] = btn.dataset.v;
        btn.closest('.filter-pills').querySelectorAll('.fpill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      });
    });

    document.getElementById('seriesSearch').addEventListener('input', e => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function applyFilters() {
    const visible = SERIES.filter(s => {
      for (const d of activeDims) {
        const want = filters[d.key];
        if (want !== 'all' && s.attrs[d.key] !== want) return false;
      }
      if (searchTerm && !(s.display + ' ' + (s.name || '')).toLowerCase().includes(searchTerm)) return false;
      return true;
    });
    renderCards(visible);
    document.getElementById('resultCount').textContent =
      visible.length + ' of ' + SERIES.length + ' variant' + (SERIES.length === 1 ? '' : 's') + ' shown';
  }

  /* ── Cards ──────────────────────────────────────── */
  const BADGE_CLASS = { voltage: 'badge-voltage', screen: 'badge-shielded', cores: 'badge-twin', armour: 'badge-airframe', standard: 'badge-general', temp: 'badge-unshielded' };
  function renderCards(list) {
    const grid = document.getElementById('prodGrid');
    if (!list.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--text-muted);font-size:15px;">No variants match the selected filters.</div>';
      return;
    }
    grid.innerHTML = list.map(s => {
      const badges = ['voltage', 'cores', 'screen', 'armour', 'temp']
        .filter(k => s.attrs[k] && (k !== 'screen' || s.attrs[k] === 'Screened'))
        .slice(0, 4)
        .map(k => '<span class="badge ' + (BADGE_CLASS[k] || 'badge-general') + '">' + esc(s.attrs[k]) + '</span>').join('');
      const specs = [
        ['Sizes', s.rows.length + ' part' + (s.rows.length === 1 ? '' : 's')],
        s.attrs.insulation ? ['Insulation', s.attrs.insulation] : null,
        s.attrs.conductor ? ['Conductor', s.attrs.conductor] : null,
        s.attrs.standard ? ['Standard', s.attrs.standard] : (s.pages && s.pages.length ? ['Catalogue Page', s.pages[0]] : null)
      ].filter(Boolean).slice(0, 4).map(([k, v]) =>
        '<div class="prod-spec"><span class="prod-spec-label">' + esc(k) + '</span><span class="prod-spec-val">' + esc(v) + '</span></div>').join('');
      return '<div class="prod-card reveal" onclick="openSpec(' + s.idx + ')" role="button" tabindex="0" onkeydown="if(event.key===\\'Enter\\')openSpec(' + s.idx + ')">' +
        '<div class="prod-card-head"><div class="prod-card-badges">' + badges + '</div>' +
        '<div class="prod-card-name">' + esc(s.display) + '</div></div>' +
        '<div class="prod-card-body"><div class="prod-card-specs">' + specs + '</div></div>' +
        '<div class="prod-card-footer"><span class="prod-card-awg">' + s.rows.length + ' part numbers</span>' +
        '<span class="prod-card-btn">View Specs &amp; Parts <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></div></div>';
    }).join('');
    if (window.__revealObs) {
      document.querySelectorAll('.prod-card.reveal:not(.visible)').forEach(el => window.__revealObs.observe(el));
    }
  }

  /* ── Spec Sheet Modal ───────────────────────────── */
  function openSpec(idx) {
    const s = SERIES[idx];
    if (!s) return;
    document.getElementById('ssCat').textContent = FAM.name + (s.pages && s.pages.length ? ' · Catalogue p.' + s.pages.join('–') : '');
    document.getElementById('ssTitle').textContent = s.display;

    const attrRows = DIMS.filter(d => s.attrs[d.key])
      .map(d => '<div class="spec-kv-row"><span class="k">' + d.label + '</span><span class="v">' + esc(s.attrs[d.key]) + '</span></div>').join('');
    const famRows = [
      FAM.voltage ? ['Family voltage', FAM.voltage] : null,
      FAM.temp ? ['Family temp range', FAM.temp] : null
    ].filter(Boolean).map(([k, v]) => '<div class="spec-kv-row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>').join('');

    const headers = (s.headers && s.headers.length ? s.headers : ['Part Number']).map(h => h && h.trim() ? h : '—');
    const thead = '<tr>' + headers.map(h => '<th>' + esc(h) + '</th>').join('') + '<th></th></tr>';
    const tbody = s.rows.map(r => {
      const pn = (r[0] || '').toString().trim();
      return '<tr>' + headers.map((_, ci) => '<td>' + esc(r[ci] != null ? r[ci] : '') + '</td>').join('') +
        '<td><button class="quote-row-btn" onclick="openQuote(' + JSON.stringify(pn).replace(/"/g, '&quot;') + ', ' + JSON.stringify(s.display).replace(/"/g, '&quot;') + ', ' + s.idx + ')">Quote</button></td></tr>';
    }).join('');

    document.getElementById('ssBody').innerHTML =
      '<div class="spec-two-col"><div class="spec-block"><h4>Variant Attributes</h4><div class="spec-kv">' + attrRows + famRows + '</div></div>' +
      '<div class="spec-block"><h4>Applicable Standards</h4><div class="standards-list">' +
      (FAM.standards || []).concat(s.attrs.standard ? [s.attrs.standard] : []).filter((v, i, a) => a.indexOf(v) === i).map(t => '<span class="std-chip">' + esc(t) + '</span>').join('') +
      '</div><h4 style="margin-top:16px;">Applications</h4><div class="spec-kv">' +
      (FAM.applications || []).slice(0, 4).map(a => '<div class="spec-kv-row"><span class="v">' + esc(a) + '</span></div>').join('') +
      '</div></div></div>' +
      '<h4 style="font-size:12px;font-weight:700;font-family:var(--mono);text-transform:uppercase;letter-spacing:0.1em;color:var(--text-faint);margin-bottom:10px;">Complete Size Range</h4>' +
      '<div class="spec-search-wrap">' +
      '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
      '<input class="spec-search-input" id="specSearchInput" type="text" placeholder="Search by part no., size…" oninput="filterSpecTable(this.value)" autocomplete="off" spellcheck="false">' +
      '<span class="spec-search-count" id="specSearchCount">' + s.rows.length + ' parts</span></div>' +
      '<div class="spec-no-match" id="specNoMatch">No parts match your search</div>' +
      '<div class="part-table-wrap"><table class="part-table" id="specPartTable"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table></div>' +
      '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">' +
      '<button class="btn btn-primary" onclick="openQuote(\\'—\\', ' + JSON.stringify(s.display).replace(/"/g, '&quot;') + ', ' + s.idx + ')">Request Quote for this Variant ' +
      '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg></button>' +
      '<button class="btn btn-ghost" onclick="closeSpec()">Close</button></div>';

    document.getElementById('specOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
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

  function closeSpec() {
    document.getElementById('specOverlay').classList.remove('open');
    document.body.style.overflow = '';
    const inp = document.getElementById('specSearchInput');
    if (inp) inp.value = '';
  }
  function handleSpecOverlayClick(e) {
    if (e.target === document.getElementById('specOverlay')) closeSpec();
  }

  /* ── Quote Modal ────────────────────────────────── */
  function openQuote(partNum, typeName, idx) {
    const s = SERIES[idx];
    document.getElementById('qPartNum').value = partNum;
    document.getElementById('qCableType').value = typeName;
    document.getElementById('qCableSpec').value = s ? JSON.stringify({
      label: s.display, family: FAM.name,
      spec: s.attrs.standard || (FAM.standards || [])[0] || '',
      voltageRating: s.attrs.voltage || FAM.voltage || '',
      temp: s.attrs.temp || FAM.temp || ''
    }) : '{}';
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
    data.subject = FAM.name + ' Quote – ' + (data.part_number || data.cable_type);
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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSpec(); closeQuote(); }
  });

  init();
  </script>

`;

const out = A + mid + B + script + tail;
fs.writeFileSync('product-family.html', out);
console.log('product-family.html written:', out.length, 'bytes');
