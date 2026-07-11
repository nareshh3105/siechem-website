// POST /api/admin-login — { password } -> { token }
const { signToken } = require('./_lib/adminAuth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { password } = req.body || {};
  const expected = (process.env.ADMIN_PASSWORD || '').trim();
  if (!expected) {
    return res.status(500).json({ error: 'Admin login is not configured' });
  }
  if (!password || password !== expected) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  return res.status(200).json({ token: signToken() });
};
