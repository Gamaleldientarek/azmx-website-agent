# The generated data files (`docs/website/data/`)

Written by the snapshot scripts; read by `build.py`; useful for programmatic answers without opening Framer. They are only as fresh as the snapshot date.

| File | Holds | Use it for |
|---|---|---|
| `pages.jsonl` | One object per page: id, path, name (templates are `/<path>/:<Collection>`), draft, meta (title, description, social image, noindex), header start variant and trigger targets, sections with ids, forms and lists with their filters | Node ids for `applyChanges`, header behaviour per page, form counts |
| `cms.json` | Every collection: id, name, who manages it, fields (id, name, type, enum cases), items (slug, draft, title) | Field ids for `var(--variable-<fieldId>)` bindings and option case ids |
| `cms-items.json` | Per collection: field id map and every item's order, slug, draft flag and the values that decide list rules (switches, dates, numbers, options) | Simulating what a list shows; finding item ids by slug |
| `components.json` | Local components with id, name, variants (breakpoint duplicates included), controls as `Name:type`, instance counts; external and icon components with counts | Component ids and exact control names |
| `code-files.json` | The code files: id, name, size, first comment, default export, property controls, override exports | What custom code exists before touching it |
| `tokens.json` | Colour styles (id, name, path, light, dark) and text styles (family, weight, size, line height, tag, breakpoints) | Design-token questions, heading-tag diagnosis |
| `live-crawl.jsonl` | One row per live URL in both languages: status, lang, dir, title, description, robots, canonical, social image, hreflang, H1s, bytes | SEO and metadata checks, H1 audits, page weight |
| `page-anatomy.json` | Per page: full height at 1440 px and each section's position and height on the live page (or `missing`) | Where a section sits on the live page |
| `project.json` | Localization totals, publish info with timestamps | Localization coverage, the snapshot's publish time |
| `layout-main.json` | The shared layout template: promo bar, header, mobile menu, footer, newsletter strip, cookie banner, per breakpoint | Anything shared by every page |
