/**
 * Places images downloaded from siechem.com (assets/company/*) into the
 * Company pages:
 *   - key-persons.html          → portrait on each of the 21 person cards
 *   - mds-message.html          → MD photo beside the signature block
 *   - manufacturing-facility.html → factory photo pair above the text
 *   - events.html               → event photo header on each card
 *   - about.html                → factory photo on the Pondicherry location card
 *
 * Run:  node scripts/add-company-images.mjs
 */
import fs from 'node:fs';

const edits = [];
function patch(file, from, to, label) {
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes(from)) { console.log('MISS:', file, '—', label); return; }
  s = s.replace(from, to);
  fs.writeFileSync(file, s);
  edits.push(file + ' — ' + label);
}

/* ── 1. Key persons: add portraits ─────────────────────────────────── */
const PEOPLE = [
  ['P. Damodaren', 'damodaren.jpg'],
  ['D. Padma', 'padma.jpg'],
  ['G.M. Arunkumar', 'arunkumar.jpg'],
  ['P. Patanjali', 'patanjali.jpg'],
  ['N. Samar Paul', 'paul.jpg'],
  ['A.K.S. Nair', 'nair.jpg'],
  ['D. Rohit', 'rohit.jpg'],
  ['D. Pooja', 'pooja.jpg'],
  ['L.S. Deepikaa', 'deepikaa.jpg'],
  ['V. Ganash', 'ganash.jpg'],
  ['Nataraj', 'nataraj.jpg'],
  ['A.S. Vasantha Kumar', 'vasanth.jpg'],
  ['Hrudananda Mahanta', 'mahanta.jpg'],
  ['J. Hemalatha', 'hemalatha.jpg'],
  ['Arun Ramachandran', 'arunram.jpg'],
  ['W. D. Hari Prasad', 'hariprasad.jpg'],
  ['B. Devipriya', 'devipriya.jpg'],
  ['V. Dhivakar', 'dhivakar.jpg'],
  ['Anto Sujesh', 'anto.jpg'],
  ['K. Mangaiyarkarasi', 'mangai.jpg'],
  ['M. Subramanian', 'subramanian.jpg']
];
{
  const file = 'key-persons.html';
  let s = fs.readFileSync(file, 'utf8');
  let hit = 0;
  for (const [name, img] of PEOPLE) {
    const from = `          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;">${name}</div>`;
    const to = `          <img src="assets/company/${img}" alt="${name}" loading="lazy" style="width:76px;height:76px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid var(--border);margin-bottom:12px;" />
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;">${name}</div>`;
    if (s.includes(from)) { s = s.replace(from, to); hit++; }
    else console.log('MISS person:', name);
  }
  fs.writeFileSync(file, s);
  edits.push(`key-persons.html — ${hit}/21 portraits added`);
}

/* ── 2. MD's Message: photo beside signature ───────────────────────── */
patch(
  'mds-message.html',
  `        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:17px;font-weight:800;color:var(--text);">P. Damodaren</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--accent-2);letter-spacing:0.08em;text-transform:uppercase;">Managing Director</span>
        </div>`,
  `        <div style="display:flex;align-items:center;gap:16px;">
          <img src="assets/company/damodaren.jpg" alt="P. Damodaren — Managing Director" style="width:72px;height:72px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid var(--border);" />
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-size:17px;font-weight:800;color:var(--text);">P. Damodaren</span>
            <span style="font-family:var(--mono);font-size:12px;color:var(--accent-2);letter-spacing:0.08em;text-transform:uppercase;">Managing Director</span>
          </div>
        </div>`,
  'MD photo beside signature'
);

/* ── 3. Manufacturing Facility: factory photos above the text ──────── */
{
  const file = 'manufacturing-facility.html';
  let s = fs.readFileSync(file, 'utf8');
  const marker = '        <p style="font-size:15.5px;line-height:1.75;color:var(--text-muted);margin-bottom:18px;">Siechem has an in-house manufacturing facility';
  if (s.includes(marker)) {
    const imgs = `        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px;">
          <img src="assets/company/pondi-factory.jpg" alt="Siechem Pondicherry factory" loading="lazy" style="width:100%;height:220px;object-fit:cover;border-radius:12px;border:1px solid var(--border);" />
          <img src="assets/company/factory-2.png" alt="Siechem manufacturing plant" loading="lazy" style="width:100%;height:220px;object-fit:cover;border-radius:12px;border:1px solid var(--border);" />
        </div>
`;
    s = s.replace(marker, imgs + marker);
    fs.writeFileSync(file, s);
    edits.push('manufacturing-facility.html — factory photo pair added');
  } else console.log('MISS: manufacturing-facility marker');
}

/* ── 4. Events: photo header on each card ──────────────────────────── */
const EVENTS = [
  ['September 2018', 'InnoTrans, Berlin', 'event-innotrans-2018.jpg'],
  ['May 2018', 'International Rail Coach Expo, ICF Chennai', 'event-irce-2018.jpg'],
  ['February 2018', 'JITO Connect, B &amp; C Mills (Binny), Chennai', 'event-jito-2018.jpg'],
  ['2016', 'ELECXPO, Chennai', 'event-elecxpo-2016.jpg'],
  ['2016', 'InnoTrans, Berlin', 'event-innotrans-2016.jpg'],
  ['—', 'Misterlight Solar', 'event-solar.jpg'],
  ['2014', 'InnoTrans, Berlin', 'event-innotrans-2014.jpg'],
  ['2012', 'InnoTrans, Berlin', 'event-innotrans-2012.jpg']
];
{
  const file = 'events.html';
  let s = fs.readFileSync(file, 'utf8');
  let hit = 0;
  for (const [date, name, img] of EVENTS) {
    const from = `        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px 22px;">
          <div style="font-family:var(--mono);font-size:11px;color:var(--accent-2);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">${date}</div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;">${name}</div>`;
    const to = `        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px 22px;">
          <img src="assets/company/${img}" alt="${name}" loading="lazy" style="width:100%;height:170px;object-fit:cover;border-radius:8px;margin-bottom:14px;" />
          <div style="font-family:var(--mono);font-size:11px;color:var(--accent-2);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">${date}</div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;">${name}</div>`;
    if (s.includes(from)) { s = s.replace(from, to); hit++; }
    else console.log('MISS event:', name, date);
  }
  fs.writeFileSync(file, s);
  edits.push(`events.html — ${hit}/8 event photos added`);
}

/* ── 5. About: factory photo on the Pondicherry location card ──────── */
patch(
  'about.html',
  `        <div class="card reveal reveal-d2" style="padding:32px;">
          <div class="eyebrow" style="margin-bottom:14px;">Manufacturing Plant</div>`,
  `        <div class="card reveal reveal-d2" style="padding:32px;">
          <img src="assets/company/pondi-factory.jpg" alt="Siechem Pondicherry factory" loading="lazy" style="width:calc(100% + 64px);margin:-32px -32px 20px;height:150px;object-fit:cover;border-radius:14px 14px 0 0;" />
          <div class="eyebrow" style="margin-bottom:14px;">Manufacturing Plant</div>`,
  'Pondicherry factory photo on location card'
);

console.log('\nDone:');
edits.forEach(e => console.log('  ✓', e));
