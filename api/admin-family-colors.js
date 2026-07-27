// PUT /api/admin-family-colors — save a family's shared colour-code table.
//   { family, colors: [{ name, code }, ...], note? }
// One table per family (not per series) since the PDFs repeat the same
// colour-code note across every product page in a segment. `note` is the
// sentence rendered above the chips; an individual series can override it
// via admin_series.color_note.
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const body = req.body || {};
  const { family, colors } = body;
  if (!family || !Array.isArray(colors)) {
    return res.status(400).json({ error: 'family and colors[] are required' });
  }
  const clean = colors
    .map(c => ({ name: String(c.name || '').trim(), code: String(c.code || '').trim() }))
    .filter(c => c.name || c.code);

  const patch = { color_code: clean, updated_at: new Date().toISOString() };
  // Only touch the note when the client actually sent one, so saving the
  // chip list alone never silently clears the note. Empty string -> NULL,
  // which makes the renderer fall back to the built-in default wording.
  if ('note' in body) {
    const note = String(body.note == null ? '' : body.note).trim();
    patch.color_note = note || null;
  }

  const db = supabaseAdmin();
  const { error } = await db.from('admin_families')
    .update(patch)
    .eq('id', family);
  if (error) return res.status(500).json({ error: error.message });

  await db.from('admin_audit_log').insert({ action: 'update_color_code', family_id: family, series_id: null, detail: { count: clean.length, noteUpdated: 'note' in body } });
  return res.status(200).json({ success: true, colors: clean, note: patch.color_note });
};
