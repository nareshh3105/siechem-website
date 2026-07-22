// /api/admin-image — upload or remove a series' 2D product image.
//   POST   { family, id, mime, base64 }  -> uploads to Supabase Storage,
//                                           stores the public URL on admin_series.image_2d
//   DELETE { family, id }                -> removes the stored file and clears image_2d
//
// Storage path is always <family>/<id>.<ext> (upsert) so the public URL for a
// given series never changes across re-uploads -- only its content does.
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

const BUCKET = 'product-images';
const MAX_BYTES = 4 * 1024 * 1024; // 4MB decoded
const MIME_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

async function logAudit(db, action, family_id, series_id, detail) {
  await db.from('admin_audit_log').insert({ action, family_id, series_id, detail });
}

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const db = supabaseAdmin();

  if (req.method === 'POST') {
    const { family, id, mime, base64 } = req.body || {};
    if (!family || !id || !mime || !base64) {
      return res.status(400).json({ error: 'family, id, mime and base64 are required' });
    }
    const ext = MIME_EXT[mime];
    if (!ext) return res.status(400).json({ error: 'Unsupported image type: ' + mime });

    let buf;
    try {
      buf = Buffer.from(base64, 'base64');
    } catch {
      return res.status(400).json({ error: 'Invalid base64 data' });
    }
    if (!buf.length) return res.status(400).json({ error: 'Empty file' });
    if (buf.length > MAX_BYTES) return res.status(400).json({ error: 'Image exceeds 4MB limit' });

    const path = `${family}/${id}.${ext}`;
    const { error: upErr } = await db.storage.from(BUCKET).upload(path, buf, {
      contentType: mime, upsert: true
    });
    if (upErr) return res.status(500).json({ error: upErr.message });

    // Clean up a stale file from a previous upload under a different extension
    // (e.g. re-uploading a JPG over an existing PNG) so orphans don't accumulate.
    const otherExts = Object.values(MIME_EXT).filter(e => e !== ext);
    const stalePaths = otherExts.map(e => `${family}/${id}.${e}`);
    await db.storage.from(BUCKET).remove(stalePaths).catch(() => {});

    const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);
    const url = pub.publicUrl + '?v=' + Date.now();

    const { error: dbErr } = await db.from('admin_series')
      .update({ image_2d: url, updated_at: new Date().toISOString() })
      .eq('family_id', family).eq('id', id);
    if (dbErr) return res.status(500).json({ error: dbErr.message });

    await logAudit(db, 'upload_image', family, id, { path });
    return res.status(200).json({ success: true, url });
  }

  if (req.method === 'DELETE') {
    const { family, id } = req.body || {};
    if (!family || !id) return res.status(400).json({ error: 'family and id are required' });

    const paths = Object.values(MIME_EXT).map(e => `${family}/${id}.${e}`);
    await db.storage.from(BUCKET).remove(paths).catch(() => {});

    const { error: dbErr } = await db.from('admin_series')
      .update({ image_2d: null, updated_at: new Date().toISOString() })
      .eq('family_id', family).eq('id', id);
    if (dbErr) return res.status(500).json({ error: dbErr.message });

    await logAudit(db, 'remove_image', family, id, null);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
