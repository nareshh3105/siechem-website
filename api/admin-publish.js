// POST /api/admin-publish
// Regenerates catalog/data/families.json + catalog/data/products/<id>.json from the
// DB (the admin panel's editable "draft" state) and commits them all to GitHub as a
// SINGLE atomic commit via the Git Data API, then triggers a Vercel production
// deploy via a deploy hook. This keeps the public site 100% static (no DB calls on
// customer pages) while still letting the admin panel's edits become live with one
// click. Using the tree/commit API instead of the Contents API means ~6 GitHub API
// calls total instead of ~2 per file (58+ for 29 files) -- much faster, and produces
// one clean commit instead of one per file.
const { requireAdmin } = require('./_lib/adminAuth');
const { supabaseAdmin } = require('./_lib/supabaseAdmin');

const REPO = 'nareshh3105/siechem-website';
const BRANCH = 'main';

async function gh(path, opts = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const resp = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'siechem-admin-publish',
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`GitHub API ${resp.status} ${path}: ${body.slice(0, 300)}`);
  }
  return resp.status === 204 ? null : resp.json();
}

// files: { [repoPath]: contentObject }
async function commitFiles(files, message) {
  const ref = await gh(`/git/refs/heads/${BRANCH}`);
  const baseCommitSha = ref.object.sha;
  const baseCommit = await gh(`/git/commits/${baseCommitSha}`);
  const baseTreeSha = baseCommit.tree.sha;

  const tree = Object.entries(files).map(([path, contentObj]) => ({
    path,
    mode: '100644',
    type: 'blob',
    content: JSON.stringify(contentObj)
  }));

  const newTree = await gh('/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree })
  });

  const newCommit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [baseCommitSha] })
  });

  await gh(`/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommit.sha })
  });

  return newCommit.sha;
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

    const files = { 'catalog/data/families.json': familiesJson };
    for (const f of families) {
      files[`catalog/data/products/${f.id}.json`] = { series: seriesByFamily[f.id] || [] };
    }

    const publishTime = new Date().toISOString();
    await commitFiles(files, `Admin publish: ${families.length} families, ${allSeries.length} series`);

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (hookUrl) {
      await fetch(hookUrl, { method: 'POST' });
    }

    await db.from('admin_publish_log').insert({ status: 'success', detail: `Published ${families.length} families, ${allSeries.length} series` });
    return res.status(200).json({ success: true, families: families.length, series: allSeries.length, publishedAt: publishTime });
  } catch (err) {
    await db.from('admin_publish_log').insert({ status: 'failed', detail: err.message });
    return res.status(500).json({ error: err.message });
  }
};
