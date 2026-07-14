// Strips stray control characters left over from icon-font bullet glyphs
// in PDF extraction. These break Postgres text/jsonb storage and would
// render as visible junk on the live site.
import fs from 'fs';

// C0 control codes 0x00-0x1F, excluding tab (0x09), LF (0x0A), CR (0x0D).
const CONTROL_RE = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]', 'g');

function sanitize(v) {
  if (typeof v === 'string') return v.replace(CONTROL_RE, '').replace(/\s+/g, ' ').trim();
  if (Array.isArray(v)) return v.map(sanitize);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k in v) o[k] = sanitize(v[k]);
    return o;
  }
  return v;
}

function collapseArrays(out) {
  return out.replace(/\[\n(\s*)((?:[^\[\]{}]*?,?\n\s*)+?)\]/g, (m, indent, body) => {
    const items = body.split(',\n').map(s => s.trim()).filter(Boolean);
    if (items.some(it => it.includes('{') || it.includes('['))) return m;
    const oneLine = '[' + items.join(', ') + ']';
    return oneLine.length <= 300 ? oneLine : m;
  });
}

const dir = 'catalog/data/products';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let cleaned = 0;
for (const f of files) {
  const p = dir + '/' + f;
  const raw = fs.readFileSync(p, 'utf8');
  const d = JSON.parse(raw);
  const before = JSON.stringify(d);
  const clean = sanitize(d);
  const after = JSON.stringify(clean);
  if (before === after) continue;
  fs.writeFileSync(p, collapseArrays(JSON.stringify(clean, null, 1)) + '\n');
  cleaned++;
  console.log('cleaned', f);
}
console.log('total cleaned:', cleaned, '/', files.length);
