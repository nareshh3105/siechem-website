// Server-only Supabase client using the service_role key — bypasses RLS.
// Never import this file from anything that ships to the browser.
const { createClient } = require('@supabase/supabase-js');

let client;
function supabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

module.exports = { supabaseAdmin };
