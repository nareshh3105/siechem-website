// POST /api/admin-publish
// Regenerates catalog/data/families.json + catalog/data/products/<id>.json from the
// DB (the admin panel's editable "draft" state), commits them to GitHub via the
// Contents API, then triggers a Vercel production deploy via a deploy hook.
// This keeps the public site 100% static (no DB calls on customer pages) while
// still letting the admin panel's edits become live with one click.
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

const REPO = 'nareshh3105/siechem-website';
const BRANCH = 'main';

async function ghRequest(path, opts = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const resp = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'siechem-admin-publish',
      ...(opts.headers || {})
    }
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`GitHub API ${resp.status} ${path}: ${body.slice(0, 300)}`);
  }
  return resp.status === 204 ? null : resp.json();
}

async function putFile(repoPath, contentObj, message) {
  const content = Buffer.from(JSON.stringify(contentObj)).toString('base64');
  let sha;
  try {
    const existing = await ghRequest(`/contents/${repoPath}?ref=${BRANCH}`);
    sha = existing.sha;
  } catch {
    sha = undefined; // file doesn't exist yet
  }
  await ghRequest(`/contents/${repoPath}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content, branch: BRANCH, ...(sha ? { sha } : {}) })
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const db = supabaseAdmin();

  try {
    const { data: families, error: famErr } = await db.from('admin_families').select('*').order('id');
    if (famErr) throw new Error(famErr.message);

    // PostgREST caps unpaginated selects at 1000 rows -- there are 1015+
    // series total, so this must be paged or the tail silently truncates.
    const allSeries = [];
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data: page, error: serErr } = await db
        .from('admin_series').select('*')
        .order('family_id').order('order_index')
        .range(from, from + PAGE - 1);
      if (serErr) throw new Error(serErr.message);
      allSeries.push(...page);
      if (page.length < PAGE) break;
    }

    const seriesByFamily = {};
    for (const s of allSeries) {
      (seriesByFamily[s.family_id] = seriesByFamily[s.family_id] || []).push({
        id: s.id,
        family: s.family_id,
        name: s.name,
        headers: s.headers,
        rows: s.rows,
        ...(s.catalogue_no ? { catalogueNo: s.catalogue_no } : {}),
        ...(s.info ? { info: s.info } : {})
      });
    }

    // families.json keeps each family's original metadata (data column) plus a
    // live seriesCount recomputed from the DB.
    const familiesJson = {
      families: families.map(f => ({
        ...f.data,
        id: f.id,
        name: f.name,
        segment: f.segment,
        seriesCount: (seriesByFamily[f.id] || []).length
      }))
    };
    await putFile('catalog/data/families.json', familiesJson, 'Admin publish: update families.json');

    for (const f of families) {
      const seriesList = seriesByFamily[f.id] || [];
      await putFile(`catalog/data/products/${f.id}.json`, { series: seriesList }, `Admin publish: update ${f.id}.json`);
    }

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (hookUrl) {
      await fetch(hookUrl, { method: 'POST' });
    }

    await db.from('admin_publish_log').insert({ status: 'success', detail: `Published ${families.length} families` });
    return res.status(200).json({ success: true, families: families.length });
  } catch (err) {
    await db.from('admin_publish_log').insert({ status: 'failed', detail: err.message });
    return res.status(500).json({ error: err.message });
  }
};
