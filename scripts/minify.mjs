/**
 * Deploy-time minifier. Copies the deployable site into dist/ and minifies
 * HTML (incl. inline CSS/JS), CSS, JS and JSON there. Source files in the
 * repo stay readable and editable — Vercel runs this via "buildCommand"
 * and serves dist/ ("outputDirectory" in vercel.json).
 *
 * Safety rule: if any individual file fails to minify, the original is
 * kept as-is — a bad file can never break the deploy or change behaviour.
 *
 * Run locally:  node scripts/minify.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { minify as minifyHtml } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';
import { minify as minifyCss } from 'csso';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

/* Top-level entries that must NOT be copied into the static output */
const EXCLUDE = new Set([
  'dist', 'node_modules', '.git', '.vercel', '.claude', 'scripts', 'supabase',
  'api',                    // serverless functions — deployed from root, not static output
  'catalogue-pdfs', 'catalog-app.part.html', 'catalog-app.part.js',
  'package.json', 'package-lock.json', 'vercel.json', '.vercelignore',
  '.gitignore', 'SiechemApp.jsx', 'tweaks-panel.jsx', 'components',
  'table_data.txt', 'siechem-redesign-2d.html'
]);

const HTML_OPTS = {
  collapseWhitespace: true,
  conservativeCollapse: true,   // keep one space where whitespace mattered
  removeComments: true,
  minifyCSS: true,
  minifyJS: { mangle: true, compress: { defaults: true } },
  removeAttributeQuotes: false, // safest — never touch attribute quoting
  keepClosingSlash: true,
  caseSensitive: true
};

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

/* 1. Copy everything deployable.
 *
 * Markdown files are internal documentation (EDITING-GUIDE, HANDOVER) and must
 * never reach the public output — they describe the infrastructure, so serving
 * them would hand an attacker a map of the system. */
for (const entry of fs.readdirSync(ROOT)) {
  if (EXCLUDE.has(entry)) continue;
  if (entry.toLowerCase().endsWith('.md')) continue;
  fs.cpSync(path.join(ROOT, entry), path.join(DIST, entry), {
    recursive: true,
    filter: src =>
      !src.includes(`${path.sep}catalog${path.sep}tools`) &&
      !src.toLowerCase().endsWith('.md')
  });
}

/* 2. Minify in place inside dist */
const stats = { html: [0, 0], css: [0, 0], js: [0, 0], json: [0, 0] };
let failed = [];

async function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { await walk(p); continue; }
    const ext = path.extname(e.name).toLowerCase();
    if (!['.html', '.css', '.js', '.json'].includes(ext)) continue;
    const src = fs.readFileSync(p, 'utf8');
    try {
      let out;
      if (ext === '.html') out = await minifyHtml(src, HTML_OPTS);
      else if (ext === '.css') out = minifyCss(src).css;
      else if (ext === '.js') out = (await minifyJs(src, { mangle: true })).code;
      else out = JSON.stringify(JSON.parse(src));
      if (!out || out.length === 0) throw new Error('empty output');
      const key = ext.slice(1);
      stats[key][0] += src.length;
      stats[key][1] += out.length;
      fs.writeFileSync(p, out);
    } catch (err) {
      failed.push(path.relative(DIST, p) + ' — ' + err.message.slice(0, 80));
      // original copy stays in place — deploy remains correct
    }
  }
}

await walk(DIST);

/* 3. Cache-bust the shared assets.
 *
 * vercel.json serves /theme.css, /animations.js and /nav-mobile.js with
 * max-age=604800 (7 days). Those URLs never change, so a returning visitor
 * kept using the CSS/JS they cached a week ago and simply did not see new
 * deploys — a design change could sit live and invisible for days.
 *
 * Appending a short content hash gives each build a distinct URL, so the
 * long cache lifetime becomes safe: unchanged files keep their hash and stay
 * cached, changed files get a new one and are fetched immediately. The
 * vercel.json header rules match on path and ignore the query string, so the
 * caching config needs no change.
 */
const SHARED = ['theme.css', 'animations.js', 'nav-mobile.js'];
const versions = {};
for (const name of SHARED) {
  const f = path.join(DIST, name);
  if (!fs.existsSync(f)) continue;
  versions[name] = crypto.createHash('sha256')
    .update(fs.readFileSync(f)).digest('hex').slice(0, 8);
}

let stamped = 0;
(function stamp(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { stamp(p); continue; }
    if (path.extname(e.name).toLowerCase() !== '.html') continue;
    let s = fs.readFileSync(p, 'utf8');
    const before = s;
    for (const [name, hash] of Object.entries(versions)) {
      // Only rewrite root-absolute refs that have no query string yet.
      s = s.replaceAll(`"/${name}"`, `"/${name}?v=${hash}"`);
    }
    if (s !== before) { fs.writeFileSync(p, s); stamped++; }
  }
})(DIST);
console.log(`cache-bust: ${Object.entries(versions).map(([n, h]) => n + '?v=' + h).join('  ')}  (${stamped} pages stamped)`);

for (const [k, [before, after]] of Object.entries(stats)) {
  if (!before) continue;
  const pct = (100 - after / before * 100).toFixed(1);
  console.log(`${k.padEnd(5)} ${(before / 1024).toFixed(0).padStart(6)} KB -> ${(after / 1024).toFixed(0).padStart(6)} KB  (−${pct}%)`);
}
if (failed.length) {
  console.log('\nkept unminified (originals copied, still functional):');
  failed.forEach(f => console.log('  •', f));
}
console.log('\ndist ready.');
