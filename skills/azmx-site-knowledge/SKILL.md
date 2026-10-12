---
name: azmx-site-knowledge
description: This skill should be used when someone asks how any part of the AZM X website is built or why it behaves as it does ("how does the glossary pager work", "why does this article show on Home", "where is the promo bar text", "which component is the footer", "what is the status of X", "what happened to Y", "how do I add a report"), or when an agent needs to find a fact about the site before changing it. It maps the website repository: where every kind of fact lives, how to search it, how to cite it, and how the record (task list, review log, backups, plans) is kept.
version: 0.1.0
---

# Finding and citing facts about the site

The website repository is the memory. Answer from its files, cite the file and heading, and separate what the files state from what is inferred. Never answer from memory of an older session, and never invent a fact to complete an answer: say what is missing and where it could be confirmed.

Paths below are the defaults; `node "${CLAUDE_PLUGIN_ROOT}/scripts/site-config.mjs"` prints the ones configured in `site-agent.json`.

## Where each kind of fact lives

| Question | Look in | Then |
|---|---|---|
| What is this site, where is it live, how big is it | handbook front matter (first 25 lines) | `site-agent.json` for the URLs |
| What page or URL exists, what the nav and footer hold | handbook › "Site map"; site map › "Live URL inventory" | |
| What is on a page, in what order, hidden on which breakpoint | site map › "Sections on every page"; handbook › "Page by page" | `data/pages.jsonl` for ids |
| Why a list shows these items (filter, sort, skip, limit, drafts) | site map › "Why these items appear"; handbook › "CMS: where the content lives" | `data/cms-items.json` to simulate |
| A collection's fields, options, item slugs, drafts | site map › "CMS collections and fields" | `data/cms.json` for field ids |
| Which component, variants, controls, where it is used | site map › "Components"; handbook › "Components library" | `data/components.json` |
| Code components, overrides, site scripts, custom code slots | handbook › "Code, custom code and integrations"; site map › "Code files"; `code/` | `data/code-files.json` |
| Forms, the newsletter, thank-you emails, the relay | handbook › "Forms" and "Integrations"; the newsletter and relay documents listed under `docs.extra` | |
| Typography, colour tokens, breakpoints | handbook › "Design system"; site map › "Text styles", "Colour styles" | `data/tokens.json` |
| Arabic and English, localization coverage | handbook › "Languages" | `data/project.json` |
| SEO, sharing, tracking status | handbook › "SEO, sharing and tracking" | `data/live-crawl.jsonl` per URL |
| How to do a routine change | handbook › "How-to recipes" (one recipe per task) | this plugin's `framer-site-ops` for the safe method |
| What is broken or limited, and known traps | handbook › "Known issues and limits" and "Working on the project safely" | review log for the story |
| Status of a task, what waits on the owner, what is built but not live | task list: the "Right now" block, then section 1 (waiting on the owner), section 2 (done but not published, in progress, next, parked) | newest review entries |
| What changed, when, why, with what evidence | review log (newest first; one dated section per change) | task list for the status |
| What was decided before the review log began | history log | |
| Design directions, options shown, previews | plans folder (`<topic>-<date>/` or `<topic>-<date>.ext`) | the task list entry names the chosen direction |
| What a node looked like before a change | backups folder: `backup-<what>-before-<change>-<date>.json` | the review entry that names it |
| The owner's working rules | the repository's rules file; task list › "Standing rules" | this plugin's `azmx-site-rules` |
| Where any other file is | task list › "Where things are"; handbook › "Where everything lives" | |

## How to search

1. Grep the handbook and the site map for the words of the question in both languages (an Arabic heading, a component name, a slug, a field name). Layer, component and field names in the docs are exact Framer names.
2. Read the matching section in full and the heading above it. The handbook's chapter numbers are stable; line numbers are not, so cite `path › heading`.
3. For status, read the task list's "Right now" block and section 1 first; the newest "Checked open list" supersedes older entries below it.
4. For "why", read the review log entry that names the change: it holds the reasoning, the backup and the evidence.
5. For anything about a live URL (title, description, H1 count, locale), read the crawl data before guessing; refresh it when the snapshot date is old (the handbook states its snapshot date at the top).

Facts that live outside the repository: tracking ids, Brevo list and template numbers, the relay hostname and secrets, editor-only settings (form destinations and after-submit redirects, header scroll triggers, image resolution, a form input's CMS value connection, the site-wide noindex, the favicon, on-page editing, deleting a collection, and anything the task list's section 1 › "Quick steps in Framer" lists). Say so when a question needs one.

## Reading paths by role

Editors: site map, CMS, languages, how-to recipes. Designers: the shared frame, page by page, components, design system. Developers and new owners: handover, code and integrations, SEO, known issues, working safely.

## Citing

Cite as `docs/website/README.md › 13. How-to recipes › Add an article` or `review.md › 11 October 2026: glossary search made fast`. Quote exact names in code font. State the snapshot date when the answer rests on generated data.

## Keeping the record

The conventions for the task list, the review log, backups and plans are in `references/keeping-the-record.md`. The procedure to refresh the handbook after changes is in `references/refreshing-the-handbook.md`. The data files and what each holds are in `references/data-files.md`.
