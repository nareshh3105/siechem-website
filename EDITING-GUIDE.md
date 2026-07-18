# How to Edit Site Content Manually

All catalogue content lives in **readable JSON files** — not in the HTML.
The HTML pages are just templates that load these files.

---

## 1. Family page content (title, description, badges, specs box)

**File: `catalog/data/families.json`**

Find your family by its `"name"` (Ctrl+F). Each field maps to the page like this:

| What you see on the page              | JSON field      | Example |
|---------------------------------------|-----------------|---------|
| Orange segment badge (top)            | `"segment"`     | `"Railways & Rolling Stock"` |
| Big page title                        | `"name"`        | `"Fluoroelastomer 200°C Cables"` |
| Description paragraph                 | `"summary"`     | `"EBXL fluoroelastomer-insulated..."` |
| VOLTAGE box                           | `"voltage"`     | `"Per locomotive spec (LV)"` |
| TEMP RATING box                       | `"temp"`        | `"-55°C to +200°C"` |
| INSULATION box                        | `"materials"`   | `["Fluoroelastomer"]` |
| SIZE RANGE box (mm²)                  | `"sizeRange"`   | `[50, 250]` |
| Download Catalogue PDF button         | `"datasheets"`  | `[{ "url": "...", "label": "..." }]` |
| APPLICATION bullets (variant cards)   | `"applications"`| `["Diesel locomotive engine areas", ...]` |
| PRODUCT VARIANTS count                | *(automatic — do not edit)* | |

## 2. Spec tables & variant pages (part numbers, columns, Application/Construction/Technical/Features)

**Files: `catalog/data/products/<family-id>.json`** (one per family, e.g. `fluoroelastomer.json`)

Each file contains a `"series"` list. Per series:

| What you see                          | JSON field      |
|---------------------------------------|-----------------|
| Variant name                          | `"name"`        |
| Table column headings                 | `"headers"`     |
| Table data (one array per row; first value = Part Number) | `"rows"` |
| APPLICATION / PRODUCT CONSTRUCTION / TECHNICAL DATA / FEATURES cards | `"info"` → `"application"`, `"construction"`, `"technical"`, `"features"` |

Note: in many series, the **first row** of `"rows"` has a blank part number and
contains the units (`"mm2"`, `"nos."`, ...) — that row renders as the units line.
Keep it as the first row.

## 3. Everything else (home page, company pages, footer, nav)

Those are plain HTML files in the repo root and `products/` — edit the text
directly in the file. `dist/` is build output — **never edit `dist/`**.

---

## ⚠️ Important: keep the admin panel in sync

The admin panel stores its own copy of this data in a database, and pressing
**Publish** in the admin panel regenerates these JSON files from the database —
**overwriting any manual edit that wasn't synced**.

So after manually editing `catalog/data/*.json`, do ONE of these before ever
pressing Publish again:

- **Easiest:** tell Claude *"I edited families.json / <family>.json manually — sync it to the database and deploy"*, or
- Run the sync script yourself:
  `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-to-supabase.mjs`
  (pushes the JSON files into the database).

## 🚀 Making your edit live

1. Edit the JSON (or HTML) file and save.
2. Sync to the database (see above) — only needed for the catalog JSON files.
3. Commit and push: `git add -A && git commit -m "content edit" && git push`
4. Deploy: `vercel --prod --yes`

Or just make the edit and ask Claude to do steps 2–4.
