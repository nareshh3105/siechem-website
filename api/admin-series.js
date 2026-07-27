// /api/admin-series — editable cable spec tables.
//   GET    ?family=<id>            -> { family, series: [...] }
//   POST   { family, id, name, headers, rows, info }         -> create
//   PUT    { family, id, name, headers, rows, info }         -> update
//   DELETE { family, id }                                     -> delete
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

async function logAudit(db, action, family_id, series_id, detail) {
  await db.from('admin_audit_log').insert({ action, family_id, series_id, detail });
}

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const db = supabaseAdmin();

  if (req.method === 'GET') {
    const familyId = req.query.family;
    if (!familyId) return res.status(400).json({ error: 'family is required' });

    const { data: family, error: famErr } = await db
      .from('admin_families').select('*').eq('id', familyId).maybeSingle();
    if (famErr) return res.status(500).json({ error: famErr.message });
    if (!family) return res.status(404).json({ error: 'Family not found' });

    const { data: series, error: serErr } = await db
      .from('admin_series').select('*').eq('family_id', familyId).order('order_index');
    if (serErr) return res.status(500).json({ error: serErr.message });

    return res.status(200).json({ family, series });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const body = req.body || {};
    const { family, id, name, headers, rows, info, order_index } = body;
    if (!family || !id) return res.status(400).json({ error: 'family and id are required' });

    const row = {
      family_id: family,
      id,
      name: name || '',
      headers: headers || [],
      rows: rows || [],
      info: info || null,
      order_index: typeof order_index === 'number' ? order_index : 0,
      updated_at: new Date().toISOString()
    };
    // Only touch image_2d when the client explicitly sent it (e.g. cloning a
    // duplicated type's existing image reference) -- image uploads normally
    // go through /api/admin-image, and omitting the key here means a plain
    // field edit never accidentally wipes out an already-attached image.
    if ('image_2d' in body) row.image_2d = body.image_2d || null;
    // Optional per-series override of the family's colour-code note. Blank
    // means "inherit the family note", so only persist when explicitly sent.
    if ('color_note' in body) {
      const n = String(body.color_note == null ? '' : body.color_note).trim();
      row.color_note = n || null;
    }
    const { error } = await db.from('admin_series').upsert(row, { onConflict: 'family_id,id' });
    if (error) return res.status(500).json({ error: error.message });

    await logAudit(db, req.method === 'POST' ? 'create_series' : 'update_series', family, id, { name });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { family, id } = req.body || {};
    if (!family || !id) return res.status(400).json({ error: 'family and id are required' });

    const { error } = await db.from('admin_series').delete().eq('family_id', family).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    await logAudit(db, 'delete_series', family, id, null);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
