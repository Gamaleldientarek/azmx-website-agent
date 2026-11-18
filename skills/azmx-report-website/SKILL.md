---
name: azmx-report-website
description: This skill should be used whenever a report is designed, built, added to the AZM X website or changed: a new report PDF or source document, a report reading page (/reports/<slug>/read), the report download page (/reports/<slug>), the Reports CMS item, a report's sections, charts, tables, hero, chapter index, internal links, "where to go next" or "talk to us" sections, its English version, its SEO and radar keywords, its share image or its email. Triggers include "new report", "add this report to the website", "build the report page", "do the same for the other report", "تقرير جديد", "صفحة التقرير", "report guideline", and a screenshot of a report page with a fix request.
version: 0.1.0
---

# Report pages on the AZM X website

Every report has two pages: the **download page** `/reports/<slug>` (a CMS template with the gated PDF and a "Read online" link) and the **reading page** `/reports/<slug>/read` (a static Framer page that carries most of the report in HTML, Arabic and English). This skill is the method. The owner's decisions and the site's ids live in the website repository, never here.

## Load first

1. **The website repository's report skill**: `.claude/skills/azmx-report/` (path in `site-agent.json` › `docs.reportSkill` when set). Its `references/decisions.md` lists every design and copy decision the owner approved (✓) or rejected (✗), with his words and the date. Follow every ✓ without asking again; never bring back a ✗. Anything not in that file is a new decision: references and two or three local mocks first, then build only what he picks, then add it to that file.
2. `azmx-site-rules` (standing rules) and `framer-site-ops` (the safe method).
3. `azmx-site-knowledge` to find the two worked examples and their record.

If the repository has no report skill yet, build nothing: say so and use this skill's method with the owner's answers, then write the decisions file as you go.

## The order

| Step | What |
|---|---|
| 1. Intake | The PDF (or draft), the palette, the slug, the cover picture, the service to link, an English edition if any. Ask only for what's missing. |
| 2. Research | Design: map each chapter to a section type, reuse approved types, research only new ones (Craftwork, Mobbin) and mock them. Search: radar keywords, their SERPs, the page that should rank. Hand both to the owner before building. |
| 3. Build | The reading page on a new branch, from the repository's build scripts, in their order: page, breakpoints, creative sections, English, in-text links, end sections, alignment and marks, SEO copy. |
| 4. Connect | Fill the Read Online link on the report's CMS item; check the download page template needs nothing. |
| 5. Check | [references/checklist.md](references/checklist.md) on the branch preview, Arabic and English, desktop and phone. |
| 6. Hand over | Preview links, the wording differences from the PDF, new copy that is yours, what wasn't checked. The owner merges and publishes. |

## Rules that hold for every report

- The report's words are its own. Every change from the PDF goes to the owner as a numbered list; nothing is fixed silently. New copy goes through the site's writing skill and is marked as yours.
- Native Framer first; the only code components are the site's existing ones.
- Never merge a report branch and never publish: the owner does both.
- In Arabic, any text without an Arabic letter (numbers, ranges, stars, Latin names, table cells) starts with a right-to-left mark, and its English value is the plain text.
- Lessons about the Framer agent on these pages: [references/lessons.md](references/lessons.md). Add new ones there and to `framer-site-ops`'s gotchas.
