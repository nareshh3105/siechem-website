// Shared helpers for admin.html / admin-family.html
(function () {
  const TOKEN_KEY = 'siechem_admin_token';

  function token() { return localStorage.getItem(TOKEN_KEY); }

  function requireAuth() {
    if (!token()) window.location.href = '/admin-login.html';
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/admin-login.html';
  }

  async function api(path, opts = {}) {
    const resp = await fetch(path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token()}`,
        ...(opts.headers || {})
      }
    });
    if (resp.status === 401) {
      logout();
      throw new Error('Session expired');
    }
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error || `Request failed (${resp.status})`);
    return data;
  }

  window.SiechemAdmin = { requireAuth, logout, api };
})();
