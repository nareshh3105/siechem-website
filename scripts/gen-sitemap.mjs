/**
 * Sitemap generator.
 *
 * Walks the repo for public .html pages and writes sitemap.xml at the root.
 * Run it after adding or removing a page:
 *
 *   node scripts/gen-sitemap.mjs
 *
 * The deploy build (scripts/minify.mjs) copies sitemap.xml into dist/ as-is,
 * so it ships to https://<domain>/sitemap.xml with no extra wiring.
 *
 * When the site moves to its own domain, change ORIGIN below — and remember
 * the canonical/og:url tags inside the HTML files need the same change.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://siechem.vercel.app';

/* Directories that never contain indexable pages */
const SKIP_DIRS = new Set([
  'dist', 'node_modules', '.git', '.vercel', '.claude',
  'scripts', 'api', 'admin', 'components', 'catalogue-pdfs',
  'tech-support-docs', 'supabase',
]);

/* Pages that render nothing without a query string — indexing them
 * produces soft-404s, so they stay out of the sitemap. */
const SKIP_PAGES = new Set([
  'catalog-app.part.html',
  'products/product-family.html',
  'products/product-variant.html',
  'catalogues/catalogue-view.html',
]);

/* The homepage is served at / via a rewrite in vercel.json */
const HOME = 'siechem-redesign.html';

function priorityFor(rel) {
  if (rel === HOME) return '1.0';
  if (rel === 'products/products.html') return '0.9';
  if (rel === 'company/about.html' || rel === 'company/contact.html') return '0.9';
  if (rel.startsWith('products/')) return '0.8';
  if (rel === 'tech-support/tech-support.html') return '0.8';
  if (rel.startsWith('company/')) return '0.7';
  return '0.6';
}

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(abs, out);
      continue;
    }
    if (path.extname(e.name).toLowerCase() !== '.html') continue;
    out.push(path.relative(ROOT, abs).split(path.sep).join('/'));
  }
  return out;
}

const pages = (await walk(ROOT))
  .filter(p => !SKIP_PAGES.has(p))
  .sort();

const today = new Date().toISOString().slice(0, 10);

const urls = pages.map(rel => {
  const loc = rel === HOME ? `${ORIGIN}/` : `${ORIGIN}/${rel}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <priority>${priorityFor(rel)}</priority>`,
    '  </url>',
  ].join('\n');
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n');

await fs.writeFile(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml written — ${pages.length} pages.`);
