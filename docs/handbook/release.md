# The release flow

Publishing the live site is the owner's act, from the Framer editor. The plugin prepares, verifies and records. `/azmx-site:release` writes the list before; `/azmx-site:check` confirms it after.

## Before: "ready for the owner to publish"

1. **Main is the only branch, or every other branch is accounted for.** A branch the session did not create is left alone and named; it may be the owner's editor work or a proof of concept he merges himself.
2. **Readiness.** `framer.agent.publish({ action: "preview" })` once: it publishes nothing and returns the diagnostics (changes, errors, warnings) and the URLs. Blocking errors mean "not ready". Typical warnings: a link inside a link, a missing variant on a form button.
3. **The batch is complete.** A publish between two steps of a change has put a half-done layout and an older site script live before. "Safe to publish" is written only when every step of the batch is on main and read back.
4. **The pre-publish list** in the task list's "Right now" block: what goes live by page, what was independently checked, what the owner decided in the editor, what to look at before publishing (a hero, a video, a form, the header or footer, custom code).

Things that only go live with a publish: the installed custom-code slot, CMS edits made straight on main, URL redirects.

## After: the live check

1. The publish time (the owner's words, or `publish-info.js`).
2. Every item marked "live after the next publish" or "merged to main", with the evidence its review entry promised.
3. Each one checked on the live site, both languages, desktop and phone: the HTML for texts, counts and metadata; screenshots through the Framer agent for layout. Fetch slowly: the CDN sometimes serves a short placeholder page.
4. Each item judged: confirmed live; not live yet; wrong (what differs, with evidence).
5. Recorded: the task list's status in the owner's wording, one dated "Live check" section in the review log, and a task-list item for anything wrong.

## Status wording

"built on the Framer branch <name>" → "checked on a branch preview" → "merged to main" / "re-read on main" / "the branch is gone" → "done; live after the next publish" → "live since the owner's publish of <date>, checked on the live site" → "confirmed live (<date>)". Never "published" by the plugin.

## Launch

The handbook's "Handover" chapter holds the launch checklist. The plugin prepares and checks every step; connecting the domain, turning indexing on, submitting the sitemap and claiming the site in search and social consoles are the owner's.
