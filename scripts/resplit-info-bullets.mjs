// Some families' info blocks (battery, ev, nuclear, sflex, silicone,
// ul-appliance, welding, wind) never got their bullets split apart --
// each block is one long string with "u+FC" (u-umlaut, the bullet glyph
// pdfplumber decoded) sitting inline between what should be separate
// bullets. Split on it, then re-apply the same noise cleanup used in
// extract_product_info.py (badge-tail strip, doubled-glyph caption strip).
import fs from 'fs';

const BULLET_GLYPH = String.fromCharCode(0xFC); // "u+FC" bullet marker
const BADGE_TAIL_RE = /\s*(?:ISO\s+){2,}.*$/i;

function collapseDoubled(s) {
  return s.replace(/(.)\1/g, '$1');
}

const NOISE_PATTERNS = [
  /^\d?D?\s*(Colour|Color)?\s*View$/i,
  /^Approvals?\b.*Certifications?/i,
  /^(Approvals?|Accreditations?|Certifications?)$/i,
  /^Catalogue\s*No\.?/i,
  /^www\.siechem\.com/i,
  /^Siechem\s*Wires?\s*&?\s*Cables?$/i,
  /^(Single|Multi|Twin|Twisted|Shielded|Unshielded|Round|Flat)\b.*(Cables?|Wires?|Cords?)\.?$/i,
];

function isNoise(line) {
  return NOISE_PATTERNS.some(p => p.test(line)) || NOISE_PATTERNS.some(p => p.test(collapseDoubled(line)));
}

function resplit(block) {
  if (!Array.isArray(block)) return block;
  const out = [];
  for (const item of block) {
    if (typeof item !== 'string' || !item.includes(BULLET_GLYPH)) { out.push(item); continue; }
    for (let piece of item.split(BULLET_GLYPH)) {
      piece = piece.replace(/\s+/g, ' ').trim().replace(/^[\s:;,]+|[\s:;,]+$/g, '');
      piece = piece.replace(BADGE_TAIL_RE, '').trim();
      if (piece.length < 3) continue;
      if (isNoise(piece)) continue;
      out.push(piece);
    }
  }
  return out;
}

const dir = 'catalog/data/products';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let changedFiles = 0, changedSeries = 0;
for (const f of files) {
  const p = dir + '/' + f;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let touched = false;
  for (const s of d.series) {
    if (!s.info) continue;
    const before = JSON.stringify(s.info);
    for (const key of ['application', 'construction', 'technical', 'features']) {
      if (s.info[key]) s.info[key] = resplit(s.info[key]);
    }
    // drop keys that ended up empty
    for (const key of Object.keys(s.info)) {
      if (!s.info[key] || !s.info[key].length) delete s.info[key];
    }
    if (!Object.keys(s.info).length) delete s.info;
    if (JSON.stringify(s.info) !== before) { touched = true; changedSeries++; }
  }
  if (touched) {
    const out = JSON.stringify(d, null, 1).replace(/\[\n(\s*)((?:[^\[\]{}]*?,?\n\s*)+?)\]/g, (m, indent, body) => {
      const items = body.split(',\n').map(s => s.trim()).filter(Boolean);
      if (items.some(it => it.includes('{') || it.includes('['))) return m;
      const oneLine = '[' + items.join(', ') + ']';
      return oneLine.length <= 300 ? oneLine : m;
    });
    fs.writeFileSync(p, out + '\n');
    changedFiles++;
    console.log('resplit', f);
  }
}
console.log(`total: ${changedFiles} files, ${changedSeries} series updated`);
