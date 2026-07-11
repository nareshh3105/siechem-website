/**
 * One-shot repo reorganiser: groups the flat HTML pages into topic folders,
 * rewrites every internal page/asset reference to be root-absolute (so a page
 * works regardless of how deep it now sits), moves the files, and writes 301
 * redirects into vercel.json so every old flat URL still resolves.
 *
 * Run:  node scripts/reorg.mjs          (performs the move + rewrites)
 *       node scripts/reorg.mjs --dry    (report only, touches nothing)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');

/* Files that stay at the root and are NOT remapped/moved at all. */
const KEEP_UNTOUCHED = new Set(['siechem-redesign-2d.html', 'catalog-app.part.html']);
/* Files that stay at the root but whose refs elsewhere must go root-absolute. */
const KEEP_AT_ROOT = new Set(['index.html', 'siechem-redesign.html']);

const COMPANY = new Set([
  'about.html', 'mission-vision.html', 'ethical-values.html', 'key-persons.html',
  'mds-message.html', 'csr.html', 'careers.html', 'contact.html', 'catalogues.html',
  'customers.html', 'events.html', 'ppt.html', 'manufacturing-facility.html',
  'testing-facilities.html', 'research-development.html', 'policies.html',
  'privacy-policy.html', 'certifications.html',
]);

function folderFor(name) {
  if (name.startsWith('ts-') || name === 'tech-support.html') return 'tech-support';
  if (name.startsWith('res-')) return 'resources';
  if (name.startsWith('product')) return 'products';
  if (name.startsWith('admin')) return 'admin';
  if (COMPANY.has(name)) return 'company';
  return null;
}

/* 1. Classify every root-level .html file. */
const allHtml = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const moves = [];               // { name, folder, target }
const remap = new Map();        // name -> absolute target path (moved + kept-at-root)

for (const name of allHtml) {
  if (KEEP_UNTOUCHED.has(name)) continue;
  if (KEEP_AT_ROOT.has(name)) { remap.set(name, '/' + name); continue; }
  const folder = folderFor(name);
  if (!folder) { console.warn('UNCLASSIFIED (left at root):', name); continue; }
  const target = `/${folder}/${name}`;
  moves.push({ name, folder, target });
  remap.set(name, target);
}

/* 2. Build the rewrite for one file's text content. */
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function rewrite(text) {
  for (const [name, target] of remap) {
    const base = escapeRe(name.replace(/\.html$/, ''));
    // Pass A: slash-prefixed (root-absolute or inside a domain URL) -> target
    text = text.replace(new RegExp('/' + base + '\\.html', 'g'), target);
    // Pass B: bare token preceded by a delimiter (quote, space, =, ( ) -> target
    text = text.replace(
      new RegExp('(^|[^\\w/.-])' + base + '\\.html', 'g'),
      (_m, p1) => p1 + target
    );
  }
  // Assets -> root-absolute (these dirs/files stay at the repo root)
  text = text.replace(/(["'(=])(assets|video)\//g, '$1/$2/');
  text = text.replace(/(["'=])(theme\.css|animations\.js|nav-mobile\.js)\b/g, '$1/$2');
  return text;
}

/* 3. Rewrite content of every deployable html file (in place, at old path). */
let changed = 0;
for (const name of allHtml) {
  if (KEEP_UNTOUCHED.has(name)) continue;
  const p = path.join(ROOT, name);
  const before = fs.readFileSync(p, 'utf8');
  const after = rewrite(before);
  if (after !== before) {
    changed++;
    if (!DRY) fs.writeFileSync(p, after);
  }
}

/* 4. Move the files into their folders. */
for (const { name, folder } of moves) {
  const dir = path.join(ROOT, folder);
  if (!DRY) {
    fs.mkdirSync(dir, { recursive: true });
    fs.renameSync(path.join(ROOT, name), path.join(dir, name));
  }
}

/* 5. Write 301 redirects (old flat url -> new) into vercel.json. */
const vjPath = path.join(ROOT, 'vercel.json');
const vj = JSON.parse(fs.readFileSync(vjPath, 'utf8'));
vj.redirects = moves
  .map(({ name, target }) => ({ source: '/' + name, destination: target, permanent: true }))
  .sort((a, b) => a.source.localeCompare(b.source));
if (!DRY) fs.writeFileSync(vjPath, JSON.stringify(vj, null, 2) + '\n');

/* Report */
const byFolder = {};
for (const m of moves) (byFolder[m.folder] ||= []).push(m.name);
console.log(DRY ? '=== DRY RUN ===' : '=== APPLIED ===');
for (const [f, list] of Object.entries(byFolder)) console.log(`${f}/ (${list.length})`);
console.log(`files moved: ${moves.length}`);
console.log(`files with rewritten refs: ${changed}`);
console.log(`redirects written: ${vj.redirects.length}`);
