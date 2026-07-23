// PUT /api/admin-family-colors — save a family's shared colour-code table.
//   { family, colors: [{ name, code }, ...] }
// One table per family (not per series) since the PDFs repeat the same
// colour-code note across every product page in a segment.
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const { family, colors } = req.body || {};
  if (!family || !Array.isArray(colors)) {
    return res.status(400).json({ error: 'family and colors[] are required' });
  }
  const clean = colors
    .map(c => ({ name: String(c.name || '').trim(), code: String(c.code || '').trim() }))
    .filter(c => c.name || c.code);

  const db = supabaseAdmin();
  const { error } = await db.from('admin_families')
    .update({ color_code: clean, updated_at: new Date().toISOString() })
    .eq('id', family);
  if (error) return res.status(500).json({ error: error.message });

  await db.from('admin_audit_log').insert({ action: 'update_color_code', family_id: family, series_id: null, detail: { count: clean.length } });
  return res.status(200).json({ success: true, colors: clean });
};
