-- Quote enquiries submitted through the website's Request a Quote forms.
-- Written by api/quote.js (Vercel serverless) using the anon key, which is
-- restricted by RLS to INSERT only — reads happen via the Supabase dashboard
-- or service-role tooling.

create table if not exists public.quote_enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  company     text,
  email       text,
  phone       text,
  part_number text,
  cable_type  text,
  quantity    text,
  delivery    text,
  message     text,
  subject     text,
  cable_spec  jsonb
);

alter table public.quote_enquiries enable row level security;

-- The website (anon key) may only add new enquiries; it can never read,
-- change or delete them.
create policy "website can insert enquiries"
  on public.quote_enquiries
  for insert
  to anon
  with check (true);
