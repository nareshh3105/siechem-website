// /api/admin-image — upload or remove a series' product image.
//   POST   { family, id, mime, base64, kind? }  -> uploads to Supabase Storage,
//                                                  stores the public URL on
//                                                  admin_series.image_2d/image_3d
//   DELETE { family, id, kind? }                -> removes the file and clears the column
//
// `kind` is '2d' (default) or '3d'. It defaults to '2d' so the original
// callers keep working unchanged.
//
// Storage path is <family>/<id>.<ext> for 2D and <family>/<id>-3d.<ext> for 3D
// (upsert), so the public URL for a given series+kind never changes across
// re-uploads -- only its content does.
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

const BUCKET = 'product-images';
// Maps the requested kind onto its DB column and storage-path suffix. Anything
// not in here is rejected rather than silently treated as 2D, so a typo can't
// overwrite the wrong image.
const KINDS = {
  '2d': { column: 'image_2d', suffix: '' },
  '3d': { column: 'image_3d', suffix: '-3d' },
};
// Vercel serverless functions cap the request body around ~4.5MB, and
// base64 inflates a file by ~33% -- a "4MB" raw file becomes a ~5.3MB JSON
// body and gets rejected before this handler ever runs. Cap well under that.
const MAX_BYTES = 2.5 * 1024 * 1024; // 2.5MB decoded (~3.3MB base64 payload)
const MIME_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

async function logAudit(db, action, family_id, series_id, detail) {
  await db.from('admin_audit_log').insert({ action, family_id, series_id, detail });
}

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const db = supabaseAdmin();

  if (req.method === 'POST') {
    const { family, id, mime, base64 } = req.body || {};
    const kind = String((req.body || {}).kind || '2d').toLowerCase();
    const spec = KINDS[kind];
    if (!spec) return res.status(400).json({ error: 'kind must be "2d" or "3d"' });
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
    if (buf.length > MAX_BYTES) return res.status(400).json({ error: 'Image exceeds 2.5MB limit — please compress or resize it first' });

    const path = `${family}/${id}${spec.suffix}.${ext}`;
    const { error: upErr } = await db.storage.from(BUCKET).upload(path, buf, {
      contentType: mime, upsert: true
    });
    if (upErr) return res.status(500).json({ error: upErr.message });

    // Clean up a stale file from a previous upload under a different extension
    // (e.g. re-uploading a JPG over an existing PNG) so orphans don't accumulate.
    const otherExts = Object.values(MIME_EXT).filter(e => e !== ext);
    const stalePaths = otherExts.map(e => `${family}/${id}${spec.suffix}.${e}`);
    await db.storage.from(BUCKET).remove(stalePaths).catch(() => {});

    const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);
    const url = pub.publicUrl + '?v=' + Date.now();

    const { error: dbErr } = await db.from('admin_series')
      .update({ [spec.column]: url, updated_at: new Date().toISOString() })
      .eq('family_id', family).eq('id', id);
    if (dbErr) return res.status(500).json({ error: dbErr.message });

    await logAudit(db, 'upload_image', family, id, { path, kind });
    return res.status(200).json({ success: true, url, kind });
  }

  if (req.method === 'DELETE') {
    const { family, id } = req.body || {};
    const kind = String((req.body || {}).kind || '2d').toLowerCase();
    const spec = KINDS[kind];
    if (!spec) return res.status(400).json({ error: 'kind must be "2d" or "3d"' });
    if (!family || !id) return res.status(400).json({ error: 'family and id are required' });

    const paths = Object.values(MIME_EXT).map(e => `${family}/${id}${spec.suffix}.${e}`);
    await db.storage.from(BUCKET).remove(paths).catch(() => {});

    const { error: dbErr } = await db.from('admin_series')
      .update({ [spec.column]: null, updated_at: new Date().toISOString() })
      .eq('family_id', family).eq('id', id);
    if (dbErr) return res.status(500).json({ error: dbErr.message });

    await logAudit(db, 'remove_image', family, id, { kind });
    return res.status(200).json({ success: true, kind });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
