/**
 * Fills the 26 Tech Support stub pages (ts-*.html) with the content scans
 * copied from www.siechem.com/tech-support/* — the old site publishes each
 * topic as a stack of scanned JPG pages, downloaded to assets/tech-support/
 * as <slug>-<n>.jpg. NFPA additionally gets its PDF download button.
 *
 * Run:  node scripts/fill-tech-support-pages.mjs
 */
import fs from 'node:fs';

/* page file → number of scan images (assets/tech-support/<slug>-N.jpg) */
const PAGES = {
  'ts-awg-sqmm': 4,
  'ts-braid-shield-calc': 1,
  'ts-cable-handling': 2,
  'ts-cable-installation': 15,
  'ts-cable-life-calc': 1,
  'ts-cable-size-auto': 4,
  'ts-cable-size-solar': 2,
  'ts-capacitance-calc': 2,
  'ts-color-code': 4,
  'ts-ptfe-comparison': 2,
  'ts-conductor-resistance': 4,
  'ts-current-carrying': 9,
  'ts-derating-factors': 4,
  'ts-electrical-losses': 2,
  'ts-impedance-calc': 2,
  'ts-inductance-calc': 1,
  'ts-insulation-resistance': 1,
  'ts-nfpa': 0,               // PDF only
  'ts-packaging': 3,
  'ts-publication': 8,
  'ts-reactance-calc': 1,
  'ts-short-circuit-calc': 2,
  'ts-toxicity-index': 1,
  'ts-voltage-drop': 1,
  'ts-wp-ebeam': 12,
  'ts-wp-ageing': 4
};

const stubRe = /  <section class="section-padding">\r?\n\s*<div class="container">\r?\n\s*<div class="stub-coming">[\s\S]*?<\/section>/;

let done = 0, missingImgs = [];
for (const [page, count] of Object.entries(PAGES)) {
  const slug = page.replace(/^ts-/, '');
  let s = fs.readFileSync(page + '.html', 'utf8');
  if (!stubRe.test(s)) { console.log('STUB NOT FOUND:', page); continue; }

  const imgs = [];
  for (let i = 1; i <= count; i++) {
    const rel = `assets/tech-support/${slug}-${i}.jpg`;
    if (!fs.existsSync(rel)) { missingImgs.push(rel); continue; }
    imgs.push(`        <img src="${rel}" alt="${slug.replace(/-/g, ' ')} — page ${i}" loading="lazy" style="width:100%;height:auto;display:block;border:1px solid var(--border);border-radius:12px;" />`);
  }

  const pdfBtn = page === 'ts-nfpa'
    ? `        <a href="assets/tech-support/nfpa-electrical-safety-standard.pdf" target="_blank" rel="noopener" class="btn btn-primary" style="color:#fff;align-self:flex-start;">
          Download NFPA Electrical Safety Standard (PDF)
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 1v8M4 6l3 3 3-3M2 12h10"/></svg>
        </a>\n`
    : '';

  const section = `  <section class="section-padding">
    <div class="container">
      <div style="max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:18px;">
${pdfBtn}${imgs.join('\n')}
      </div>
    </div>
  </section>`;

  s = s.replace(stubRe, section);
  fs.writeFileSync(page + '.html', s);
  done++;
}
console.log('pages filled:', done, '/', Object.keys(PAGES).length);
if (missingImgs.length) { console.log('MISSING IMAGES:'); missingImgs.forEach(m => console.log(' ', m)); }
