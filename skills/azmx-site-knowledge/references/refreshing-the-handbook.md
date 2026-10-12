# Refreshing the handbook

The handbook is a snapshot of the Framer project and the live site; its date is at the top. Refresh it after a round of changes. The authoritative procedure is `docs/website/snapshot/README.md` in the website repository; read it first, it changes.

1. Prerequisites: a Framer agent session on **main** (the scripts stop on a branch), Node 18 or newer, Python 3 with Pillow, Google Chrome, and `puppeteer-core` installed in a scratch folder (`PUPPETEER_SKIP_DOWNLOAD=1`).
2. Snapshot, from the snapshot folder, into a scratch folder outside the repository: the three `exec` scripts (project, CMS values, localization), then `pack.py urls`, `crawl.mjs`, `pack.py expected`, `capture.mjs` (screenshots and section boxes), `pack.py pack` (writes `data/` and `map/`). All read-only.
3. Checks: every URL answers 200 except `/en` (redirect); re-crawl pages with 0 H1s (the CDN sometimes serves a placeholder with the Home title); the localization count stays around its usual size with about 20 missing (a sharp drop means an incomplete list: rerun); bracketed section names are expected only for unnamed frames.
4. Update the snapshot date in `build.py` and in the handbook README, then run `python3 docs/website/build.py` from the repository root. It regenerates `handbook.html`, `how-to-open.html`, `site-map.md`, the guide's generated tables, and light copies in `artifact/` (gitignored).
5. Retake the previews at 1440 px and republish the two online pages from the light copies. Those two steps need the owner's machine (fonts and the artifact publish); a cloud session stops after step 4 and says so.

A hand edit to the site map (as was done once for a new CMS field) is lost at the next build unless the snapshot is refreshed first.
