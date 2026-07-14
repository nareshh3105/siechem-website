// GET /api/admin-families — list all families with series counts and draft status,
// for the admin dashboard.
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

  // PostgREST caps unpaginated selects at 1000 rows -- there are 1015+
  // series total, so this must be paged or counts/timestamps silently
  // miss whatever falls past row 1000.
  const seriesMeta = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: page, error: cntErr } = await db
      .from('admin_series')
      .select('family_id, updated_at')
      .range(from, from + PAGE - 1);
    if (cntErr) return res.status(500).json({ error: cntErr.message });
    seriesMeta.push(...page);
    if (page.length < PAGE) break;
  }

  const countByFamily = {};
  const lastEditByFamily = {};
  for (const row of seriesMeta) {
    countByFamily[row.family_id] = (countByFamily[row.family_id] || 0) + 1;
    const t = row.updated_at ? new Date(row.updated_at).getTime() : 0;
    if (t > (lastEditByFamily[row.family_id] || 0)) lastEditByFamily[row.family_id] = t;
  }

  // Compare against snapshot_at (when the publish started reading the DB),
  // not created_at (when it finished, after the slow GitHub upload) -- an
  // edit saved while a publish is mid-flight isn't in that publish's export
  // even though the success log row gets written after the edit.
  const { data: lastPublish } = await db
    .from('admin_publish_log')
    .select('created_at, snapshot_at')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastPublishedAt = lastPublish ? (lastPublish.snapshot_at || lastPublish.created_at) : null;
  const lastPublishedMs = lastPublishedAt ? new Date(lastPublishedAt).getTime() : 0;

  const out = families.map(f => ({
    id: f.id,
    name: f.name,
    segment: f.segment,
    summary: f.data && f.data.summary,
    seriesCount: countByFamily[f.id] || 0,
    hasDraftChanges: (lastEditByFamily[f.id] || 0) > lastPublishedMs
  }));

  return res.status(200).json({ families: out, lastPublishedAt });
};
