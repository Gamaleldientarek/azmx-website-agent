# Questions the team asks, and where the answer lives

Each answer names the place in the website repository that holds the fact, because the facts change and the record is the source of truth. `/azmx-site:ask <question>` does this lookup for you.

## About the site

**Where is the site live, and what is the final domain?**
The handbook's front matter and the repository README. The final domain is listed as not switched yet; the handbook's "Handover" chapter holds the launch checklist.

**Which pages exist, in which languages?**
Handbook › "Site map", and the site map's "Live URL inventory" (every URL in both languages with its title). Arabic is at `/`, English at `/en/`.

**What is on a page, and in what order?**
Site map › "Sections on every page" (visibility per breakpoint, the lists and components in each section), handbook › "Page by page" for the narrative.

**Why does this list show these items and not others?**
Site map › "Why these items appear": one row per list with the rule (published only, filter, sort, skip, limit) and what it showed at the snapshot. Drafts never show; a featured switch, a sort value or a limit explains most surprises.

**Which component is this, and where else is it used?**
Site map › "Components" (name, variants, controls, instance count) and handbook › "Components library".

**What custom code and scripts exist?**
Handbook › "Code, custom code and integrations", site map › "Code files", and the repository's `code/` folder (copies of the code components, overrides and site scripts).

**How do the forms and the newsletter work?**
Handbook › "Forms" and "Integrations", then the newsletter and relay documents named in `site-agent.json` under `docs.extra`.

**What fonts, colours and text styles does the site use?**
Handbook › "Design system"; site map › "Text styles" and "Colour styles".

## Doing things

**How do I add an article, a report, a case study, a job, a person, a testimonial, an award, a glossary term, a service, a page?**
Handbook › "How-to recipes": one recipe each, with the editor-only steps and the steps that need the owner. `/azmx-site:do add a report` routes it and adds the safety steps.

**How do I change the order of a list?**
Handbook › "Arrange any CMS collection": the lists follow CMS order unless they sort by a field; the recipe says which.

**How do I translate something?**
Handbook › "Languages" and this plugin's `azmx-site-rules/references/arabic.md`. Through the agent: `framer-site-ops/references/procedures.md` › "A translation pass".

**Can the agent set the form's destination, the header scroll triggers, or delete a collection?**
No. These are editor-only; the guide writes the exact editor steps and the owner does them. The list is in `site-guide` and the handbook's "Known issues and limits".

**Who publishes?**
The owner, from the Framer editor. The plugin prepares, merges to main, verifies and records; a hook blocks any production publish from a session. `/azmx-site:release` writes the pre-publish list.

**How do I check that a change is live?**
`/azmx-site:check` after the owner publishes: it takes every "live after the next publish" item and confirms it on the live site in both languages, then records "confirmed live".

## The record

**What is waiting on the owner right now?**
The task list's "Right now" block and section 1, starting with the newest "Checked open list". `/azmx-site:status` reads it.

**What is built but not yet live?**
The task list's section 2: every `###` ending in "live after the next publish" or "merged to main".

**What changed on a given day, and why?**
The review log: one dated section per change, newest first, with the reasoning, the evidence and the backup file.

**How do I undo a change?**
The backups folder holds a JSON of every node before it was changed, named in the review entry. There is no restore script: read the backup, confirm what is on main now, and re-apply the saved values with the same API on a branch. `framer-site-ops/references/procedures.md` has the steps.

**The handbook says one thing and the site another.**
The handbook is a snapshot; its date is at the top. Trust the newer source (task list, review log, the live site), and refresh the handbook with `/azmx-site:handbook refresh`.

## Working from the cloud

**How does a cloud session sign in to Framer?**
With a Framer API key in the environment variable `FRAMER_API_KEY`, never in a file or a chat. Steps in `docs/handbook/cloud.md` of this plugin and the repository's cloud setup document.

**What can a cloud session not do?**
Open the Framer editor, open the live site in a browser (unless the environment allows the domains), read files that are not committed, and finish the handbook refresh (fonts and the artifact republish live on the owner's machine). Screenshots through the Framer agent still work.

## Safety

**What does the plugin never do?**
Publish the live site, write on main without a backup, store or print a key, hide or remove a section or asset without the owner's yes, send anything anywhere except to Framer and GitHub. `SECURITY.md` says how each is enforced.

**What can a stranger do with the public repository?**
Install it against their own Framer project. The AZM X project, the website repository and the key are all private and absent from the plugin.
