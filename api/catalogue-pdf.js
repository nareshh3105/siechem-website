// GET /api/catalogue-pdf?family=<id>
// Streams a family's catalogue PDF from its GitHub Release asset.
//
// Why a proxy instead of linking straight to the release URL: GitHub always
// serves release assets with Content-Disposition: attachment and
// Content-Type: application/octet-stream (neither is configurable), which
// makes every browser download the file instead of rendering it in an
// <iframe>. There's also no CORS header, so client-side fetch() can't read
// it either. This endpoint re-fetches the file server-side (no CORS
// involved between servers) and re-serves it with headers that make the
// browser's built-in PDF viewer render it inline.
const { Readable } = require('stream');

let familiesCache = null;
function loadFamilies() {
  if (!familiesCache) {
    familiesCache = require('../catalog/data/families.json').families;
  }
  return familiesCache;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const familyId = req.query.family;
  if (!familyId) return res.status(400).json({ error: 'family is required' });

  const fam = loadFamilies().find(f => f.id === familyId);
  const url = fam && fam.datasheets && fam.datasheets[0] && fam.datasheets[0].url;
  if (!url) return res.status(404).json({ error: 'No catalogue PDF for this family' });

  let upstream;
  try {
    upstream = await fetch(url);
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach catalogue storage: ' + e.message });
  }
  if (!upstream.ok || !upstream.body) {
    return res.status(502).json({ error: 'Upstream returned ' + upstream.status });
  }

  const filename = (fam.datasheets[0].label || familyId + '.pdf').replace(/[^\w.\- ]/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
  // Release assets are effectively immutable (a new upload would need a new
  // tag), so cache aggressively -- these files are tens to hundreds of MB.
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  const len = upstream.headers.get('content-length');
  if (len) res.setHeader('Content-Length', len);

  Readable.fromWeb(upstream.body).pipe(res);
};
