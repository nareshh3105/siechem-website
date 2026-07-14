// One-time / re-runnable import: catalog/data/families.json + products/*.json -> Supabase.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-to-supabase.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const DATA_DIR = path.join(process.cwd(), 'catalog', 'data');
const { families } = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'families.json'), 'utf-8'));

const familyRows = families.map(f => ({
  id: f.id,
  name: f.name,
  segment: f.segment,
  data: f
}));

console.log(`Importing ${familyRows.length} families...`);
{
  const { error } = await db.from('admin_families').upsert(familyRows, { onConflict: 'id' });
  if (error) { console.error('families import failed:', error.message); process.exit(1); }
}

let totalSeries = 0;
for (const f of families) {
  const file = path.join(DATA_DIR, 'products', `${f.id}.json`);
  if (!fs.existsSync(file)) { console.warn(`  ! no products file for ${f.id}, skipping`); continue; }
  const { series } = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const seriesRows = series.map((s, idx) => ({
    id: s.id,
    family_id: f.id,
    name: s.name || '',
    order_index: idx,
    headers: s.headers || [],
    rows: s.rows || [],
    info: s.info || null,
    catalogue_no: s.catalogueNo || null
  }));
  const { error } = await db.from('admin_series').upsert(seriesRows, { onConflict: 'family_id,id' });
  if (error) { console.error(`  ! ${f.id} series import failed:`, error.message); continue; }
  totalSeries += seriesRows.length;
  console.log(`  ${f.id}: ${seriesRows.length} series`);
}

console.log(`Done. ${familyRows.length} families, ${totalSeries} series imported.`);
