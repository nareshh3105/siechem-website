# Siechem Interactive Catalog — Data & Pipeline Documentation

## What this is
`catalog.html` is a data-driven product selector that replaces manual PDF browsing.
Every specification shown is machine-extracted from the official Siechem PDF
catalogues in `catalogue-pdfs/` — nothing is invented, estimated, or hand-typed.

**Coverage:** 28 product families · 1,026 cable series · 17,299 size rows.

## Data files (`catalog/data/`)

| File | Loaded | Contents |
|---|---|---|
| `families.json` | eagerly (~40 KB) | One record per product family: name, segment, curated summary, applications, voltage/temperature ratings, aggregated materials/standards/size ranges (computed from series data), source PDF filenames. |
| `products/<family>.json` | lazily per family | Full series records: title, verbatim table headers + rows from the PDF, footnote/colour-code notes, parsed attributes (`voltage`, `materials`, `conductors`, `shielded`, `armoured`, `halogenFree`, `fireSafety`, `standardsFound`, `sizesSqmm`, `cores`, `awg`), and the PDF page numbers each table came from. |
| `search-index.json` | lazily on first search/filter (~670 KB) | One light record per series with a searchable text blob (name + part numbers + standards + keywords) and facet fields. |
| `filters.json` | reference | Global facet counts snapshot. |
| `review-flags.json` | reference | 125 series flagged for human review — mostly tables whose headers are garbled in the source PDF itself (overlapping text layers, e.g. the FRX fire-resistant tables). Data is kept verbatim, never guessed. |

## Design principles
1. **Verbatim tables.** Spec table headers and rows are shown exactly as printed in
   the PDF (units included in headers). Parsed attributes are *additional*, used only
   for filtering — a parsing gap can never corrupt a displayed spec.
2. **Validation by construction.** Filter options and configurator steps are computed
   from the data at runtime. An option that would yield zero results never appears,
   so invalid spec combinations cannot be selected.
3. **Missing data stays missing.** Empty PDF cells stay empty. Problem series are
   listed in `review-flags.json` instead of being "repaired".
4. **Performance.** Family data and the search index are fetched only when needed;
   facet counting runs in-memory over ~1,000 light records (instantaneous).

## The pipeline (`catalog/tools/`)

    PDF ──1_dump_pdf.py──▶ page dumps (JSONL: text + tables, PyMuPDF)
        ──2_build_series.py──▶ series records (title detection, table filtering,
                                continuation-page merging, attribute parsing)
        ──families_meta.py──▶ curated family metadata (edit by hand)
        ──3_finalize.py──▶ catalog/data/*.json

### Adding a new PDF catalogue
1. Drop the PDF into `catalogue-pdfs/`.
2. Run `python3 catalog/tools/1_dump_pdf.py "<pdf path>" 600` (resumable; writes a JSONL dump).
3. Add one entry to `FAMILIES` in `catalog/tools/families_meta.py` (id, name, segment,
   summary, applications, voltage, temp, keywords) and to `PDF_FILE`.
4. Run `2_build_series.py` then `3_finalize.py`.
5. Check `review-flags.json` for anything the extractor flagged.

No UI changes are needed — the page renders whatever is in the data files.

### Updating an existing catalogue
Replace the PDF, delete its dump JSONL, re-run steps 2–4.

## Quotation flow
The quote basket POSTs to the existing `/api/quote` serverless function with
`cable_spec` = the full spec of each selected size row (header → value, verbatim),
plus family/series/standards context, so sales receives everything needed to price
the enquiry. Multi-item baskets are flattened as "Item N — field".

## Known items for review
- `catalogue-pdfs/` is git-ignored (947 MB). The "Original datasheet (PDF)" buttons
  therefore 404 on Vercel until the PDFs are hosted somewhere (options: Vercel Blob,
  SharePoint public links, or a CDN). Locally they work as-is.
- 125 series in `review-flags.json` have garbled headers inherited from the source
  PDFs — worth checking against print copies before publishing those tables.
