// GET /api/admin-families — list all families with series counts, for the admin dashboard.
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const db = supabaseAdmin();
  const { data: families, error: famErr } = await db
    .from('admin_families')
    .select('id, name, segment, data')
    .order('name');
  if (famErr) return res.status(500).json({ error: famErr.message });

  const { data: counts, error: cntErr } = await db
    .from('admin_series')
    .select('family_id');
  if (cntErr) return res.status(500).json({ error: cntErr.message });

  const countByFamily = {};
  for (const row of counts) {
    countByFamily[row.family_id] = (countByFamily[row.family_id] || 0) + 1;
  }

  const out = families.map(f => ({
    id: f.id,
    name: f.name,
    segment: f.segment,
    summary: f.data && f.data.summary,
    seriesCount: countByFamily[f.id] || 0
  }));

  return res.status(200).json({ families: out });
};
