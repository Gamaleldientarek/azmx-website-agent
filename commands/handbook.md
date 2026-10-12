---
description: Open the website handbook, or refresh it after changes to the site
argument-hint: [open | refresh | where <topic>]
allowed-tools: Read, Grep, Glob, Bash(node:*), Bash(python3:*), Bash(npx @framer/agent:*), Bash(npx -y @framer/agent:*)
---

Work with the website handbook, the single document that describes every page, list, component, code file and setting of the site. The paths come from `site-agent.json` (`docs.handbook` is the guide in Markdown, `docs.siteMap` the generated site map, and the folder that holds them has `handbook.html`, `build.py` and `snapshot/`).

Interpret `$ARGUMENTS`:

- **`open`** or nothing: say where the handbook is and how to open it. Read the repository README's "Open it" table and repeat its ways (online page, GitHub download, the project folder, the Framer design page, the Markdown guide). Then list the guide's chapters from its "Contents" section so the person can ask for one. Do not print the handbook itself.
- **`where <topic>`**: find where the topic is documented. Grep the guide and the site map for the words, read the matching sections, and answer with the chapter name, the heading and a two-line summary, then the file path and line numbers. If the topic is not in the handbook, say so and check the task list and review log before answering.
- **`refresh`**: regenerate the handbook from a fresh snapshot of the Framer project and the live site. Read `snapshot/README.md` in the handbook folder first; it is the procedure and it changes. In summary: Framer must be on main; run the three `exec` snapshot scripts into a scratch folder outside the repository; run `pack.py urls`, `crawl.mjs`, `pack.py expected`, `capture.mjs` (needs `puppeteer-core` and Chrome), `pack.py pack`; then `python3 build.py` in the handbook folder. Before building, update the snapshot date in `build.py` and the handbook README. After building, say which previews in `preview/` must be retaken at 1440 px and that the two online pages are republished from the light copies in `artifact/` (that step is the owner's). Report the counts the README asks to check (URLs answering 200, localization strings) and anything that moved.

Rules: the snapshot scripts only read; never run them on a branch; never commit the `artifact/` folder (it is ignored).
