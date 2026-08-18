# Siechem Website — Technical Handover

This document is for the engineer who takes over running this site. It covers what
the system is made of, which external accounts it depends on, and the exact steps
to transfer it without breaking anything.

For day-to-day **content editing**, see [EDITING-GUIDE.md](EDITING-GUIDE.md) instead.

---

## 1. What this site is

A **static HTML site** with no framework — no React, no build-time templating, no
CMS runtime. Every public page is a hand-written `.html` file committed to the repo.

A small set of **serverless functions** (in `api/`) provide the parts that can't be
static: the quote-request form, and the admin panel that lets staff edit the product
catalogue.

Deployment is on **Vercel**. The build step (`scripts/minify.mjs`) copies the site
into `dist/` and minifies it; Vercel serves `dist/`.

```
Browser ──► Vercel CDN ──► dist/*.html          (static pages, catalogue JSON)
                    └────► api/*.js             (serverless: quote form, admin)
                                  └──► Supabase (admin catalogue database)
                                  └──► GitHub   (publish writes catalogue JSON back)
                                  └──► Gmail    (quote notification emails)
```

### Why the catalogue is JSON, not a live database

Public pages never talk to a database. The catalogue lives in committed JSON files
(`catalog/data/`), which the browser fetches as plain static files. The admin panel
edits a Supabase database, and **Publish** regenerates those JSON files and commits
them. This keeps customer-facing pages fast and dependency-free — if Supabase went
down, the public site would be unaffected.

The trade-off: catalogue changes are not live until someone clicks **Publish**.

---

## 2. External accounts this site depends on

The site cannot run without all five. Each must be owned by Siechem after handover.

| Service | What it does | Breaks if lost |
|---|---|---|
| **GitHub** | Source code, and hosts the 30 catalogue PDFs as Release assets | Publish button; all catalogue PDF downloads |
| **Vercel** | Hosting, build, serverless functions, env vars | Entire site |
| **Supabase** | Admin catalogue database + product image storage | Admin panel; all product images |
| **Gmail** | Sends quote-request notification emails | Quote form emails |
| **Cloudflare** | DNS for siechem.com | Domain resolution |

---

## 3. Environment variables

All eight are set in **Vercel → Settings → Environment Variables**. They are not in
the repo, and `.env` files are gitignored. After a transfer, every one must be
re-entered on the new Vercel account.

| Variable | Purpose | Where to get it |
|---|---|---|
| `SUPABASE_URL` | Supabase project API URL | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB key; **bypasses row-level security** | Supabase → Project Settings → API |
| `GITHUB_TOKEN` | Lets Publish commit catalogue JSON | GitHub → Settings → Developer settings → Fine-grained PAT |
| `VERCEL_DEPLOY_HOOK_URL` | Triggers a rebuild after Publish commits | Vercel → Settings → Git → Deploy Hooks |
| `GMAIL_USER` | Sender **and recipient** of quote emails | The Siechem sales mailbox |
| `GMAIL_PASS` | Gmail **App Password** (not the login password) | Google Account → Security → App Passwords |
| `ADMIN_PASSWORD` | Password for the admin panel login | Choose one; store in the company password manager |
| `ADMIN_SESSION_SECRET` | Signs admin session tokens | Any long random string (`openssl rand -hex 32`) |

> **`SUPABASE_SERVICE_ROLE_KEY` bypasses all database security.** It is server-only.
> Never put it in client-side code, and never commit it.

### The GitHub token expires by default

Personal Access Tokens default to a 30-day expiry. When this token expires, the
admin panel's Publish button fails with **"GitHub API 401: Bad credentials"** — the
rest of the site keeps working, so it looks like an admin bug rather than an expired
credential. This has already happened once.

When creating the replacement, use a **fine-grained PAT** with:
- Repository access: **only** the siechem website repo
- Permissions: **Contents → Read and write**
- Expiration: **No expiration**

---

## 4. How the admin panel works

**URL:** `/admin` · **Login:** the value of `ADMIN_PASSWORD`

Sessions are stateless — a signed token valid for 12 hours, with no session table.
Changing `ADMIN_SESSION_SECRET` immediately logs everyone out.

### The publish pipeline

Editing in the admin panel writes to Supabase only. Nothing is public until Publish.

```
1. Staff edits a family/series      ──► Supabase (admin_families, admin_series)
2. Change is marked as draft        ──► admin_audit_log records the action
3. Staff clicks PUBLISH
4. api/admin-publish.js reads the whole catalogue from Supabase
5. Regenerates families.json + products/<id>.json
6. Commits all files as ONE commit via the GitHub Git Data API
7. Calls VERCEL_DEPLOY_HOOK_URL
8. Vercel rebuilds and the changes go live (~1–2 minutes)
```

Deletions are tracked too — `admin_audit_log` is queried for `delete_series` and
`remove_image` entries since the last publish, so a family whose only pending change
is a deletion still shows as having unpublished changes.

### Database tables

| Table | Contents |
|---|---|
| `admin_families` | Product families (name, segment, summary, specs) |
| `admin_series` | Product series/variants within each family |
| `admin_audit_log` | Every admin action — the source of truth for "what changed since last publish" |
| `admin_publish_log` | Timestamp of each publish |

Product images go to the Supabase Storage bucket **`product-images`**.

---

## 5. How quote-request emails work

A customer submits the quote form → `api/quote.js` sends **two** emails via Gmail SMTP:

1. **To the company** — the enquiry details, sent to `GMAIL_USER`
2. **To the customer** — an acknowledgement

`GMAIL_PASS` must be a Google **App Password**, which requires 2-Step Verification
on the account. A normal account password will not authenticate.

> The company notification is sent **to `GMAIL_USER` itself** — the same address that
> sends it. Whatever address is in that variable receives every sales enquiry from the
> website.

---

## 6. Deploying

### Normal code change

```bash
node scripts/minify.mjs
git add -A
git commit -m "your message"
git push origin main
vercel --prod --yes
```

Pushing to `main` alone is not always sufficient — run `vercel --prod --yes` to be
certain production is updated.

### After adding or removing a page

Regenerate the sitemap, then deploy as above:

```bash
node scripts/gen-sitemap.mjs
```

### Publishing catalogue changes

Use the admin panel's Publish button. Don't hand-edit `catalog/data/*.json` — the
next Publish regenerates those files from Supabase and overwrites manual edits.

---

## 7. Things that are hardcoded and will break on transfer

These are **not** environment variables. Code and data changes are required.

### a) The repo path in the publish code

`api/admin-publish.js` line 13:

```js
const REPO = 'nareshh3105/siechem-website';
```

After the repo moves to the Siechem account, Publish keeps trying to commit to the
old path and fails. Update this line — ideally convert it to an env var so future
transfers need no code change.

### b) 30 catalogue PDFs on GitHub Releases

Every catalogue download link in `catalog/data/families.json` looks like:

```
https://github.com/nareshh3105/siechem-website/releases/download/catalogues-v1/aero-44.pdf
```

The PDFs are **Release assets on the personal repo** (they are too large to commit —
`catalogue-pdfs/` is gitignored). GitHub redirects these URLs after a transfer, but
they break permanently if the repo is renamed or the old account is deleted. After
transfer, re-create the `catalogues-v1` release on the Siechem repo and update these
URLs.

### c) Product image URLs point at a specific Supabase project

Image URLs are baked into the committed JSON as absolute paths:

```
https://fihlhaqxpiobwfotxsxs.supabase.co/storage/v1/object/public/product-images/...
```

**Transfer the existing Supabase project's ownership — do not create a new one.**
Creating a new project changes the subdomain, which breaks every product image on
the site. Recovering from that means re-uploading all images and rewriting every URL.

### d) Canonical URLs

13 HTML files hardcode `https://siechem.vercel.app/` in `<link rel="canonical">` and
`og:url` tags. `robots.txt` and `scripts/gen-sitemap.mjs` also carry the domain.
Once siechem.com is live, all of these must change together — otherwise Google
credits the `.vercel.app` address instead of the real domain.

---

## 8. Transfer checklist

Work top to bottom. Steps in Phase 2 must happen before Phase 3.

### Phase 1 — Siechem creates accounts

- [ ] GitHub account or organisation
- [ ] Vercel account on a **paid plan** (see the warning below)
- [ ] Supabase account
- [ ] A company mailbox for quote enquiries (e.g. `sales@siechem.com`), with
      2-Step Verification enabled so an App Password can be generated

> **The current Vercel project is on the Hobby plan, which permits non-commercial
> use only.** A company website on Hobby violates Vercel's terms and can be
> suspended. Siechem needs a Pro plan (~$20/month).

### Phase 2 — Transfer ownership

- [ ] GitHub: **Settings → Transfer ownership** → Siechem account
- [ ] GitHub: re-create the `catalogues-v1` release and upload the 30 catalogue PDFs
- [ ] Supabase: **transfer the existing project** to the Siechem organisation
      (do not create a new project — see §7c)
- [ ] Vercel: **Settings → Transfer project** → Siechem account
- [ ] Cloudflare: confirm Siechem controls the siechem.com DNS zone

### Phase 3 — Re-issue every credential

- [ ] `GITHUB_TOKEN` — new fine-grained PAT, no expiration, Contents read/write
- [ ] `GMAIL_USER` / `GMAIL_PASS` — company mailbox and its App Password
- [ ] `ADMIN_PASSWORD` — new password, stored in the company password manager
- [ ] `ADMIN_SESSION_SECRET` — new random string
- [ ] `VERCEL_DEPLOY_HOOK_URL` — new hook from the new Vercel project
- [ ] `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from the transferred project
- [ ] Revoke the old developer's tokens and remove their account access

### Phase 4 — Code changes

- [ ] Update `REPO` in `api/admin-publish.js` (§7a)
- [ ] Update the 30 PDF URLs in `catalog/data/families.json` (§7b)
- [ ] Update canonical/`og:url` tags, `robots.txt`, and `gen-sitemap.mjs` to
      siechem.com (§7d), then run `node scripts/gen-sitemap.mjs`

### Phase 5 — Verify before signing off

- [ ] Site loads on siechem.com with a valid SSL certificate
- [ ] **Submit a test quote → confirm it arrives in the Siechem mailbox**, not a
      personal one
- [ ] Log into `/admin`, make a small edit, click **Publish**, confirm it goes live
- [ ] Open a catalogue PDF and confirm it downloads
- [ ] Confirm product images render on product pages
- [ ] Verify the domain in Google Search Console and submit `/sitemap.xml`

---

## 9. Repository layout

```
siechem-redesign.html      Homepage (served at / via a rewrite in vercel.json)
company/                   About, careers, certifications, policies, contact…
products/                  Product pages and spec configurators
resources/                 Resources pages (5S, REACH, RoHS, awards…)
tech-support/              Engineering calculators and reference tables
catalogues/                Catalogue flipbook viewer
admin/                     Admin panel pages (excluded from search indexing)

api/                       Serverless functions
  _lib/adminAuth.js          Signed admin session tokens
  _lib/supabaseAdmin.js      Server-only Supabase client
  admin-publish.js           The publish pipeline (see §4)
  quote.js                   Quote form emails (see §5)
  catalogue-pdf.js           Proxies catalogue PDFs so they render inline

catalog/data/              Generated catalogue JSON — do not hand-edit
scripts/minify.mjs         Build: copies site to dist/ and minifies
scripts/gen-sitemap.mjs    Regenerates sitemap.xml
theme.css                  Sitewide styles
vercel.json                Routing, redirects, cache headers
```

### Query-param templates

`products/product-family.html`, `products/product-variant.html`, and
`catalogues/catalogue-view.html` render nothing without a query string — they are
templates driven by `?id=`. They are deliberately excluded from `sitemap.xml`.

---

## 10. Known issues and deferred work

- **`REPO` should be an environment variable.** Hardcoding it means every future
  ownership change needs a code edit (§7a).
- **Catalogue PDFs depend on GitHub Releases.** Workable, but a dedicated file host
  or Supabase Storage would be less fragile than release assets (§7b).
- **No automated tests.** Verification is manual — the Phase 5 checklist is the
  practical substitute.
- **`catalogue-pdfs/` is gitignored** (~1.9 GB, exceeds GitHub's file size limit).
  Keep a separate backup of the source PDFs; they are not recoverable from the repo.
- **`.gitignore` blanket-ignores `*.txt` and `*.json`**, with named exceptions.
  A new file of either type will be silently ignored unless an exception is added —
  this is easy to miss, since `git add` gives no warning.
