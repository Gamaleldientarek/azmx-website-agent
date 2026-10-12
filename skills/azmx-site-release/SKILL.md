---
name: azmx-site-release
description: This skill should be used when work on the AZM X website is finished and someone asks "is it safe to publish", "what goes live with the next publish", "prepare the release", "check the live site", "verify after the publish", "confirm it's live", or when an agent must write a status such as "live after the next publish" or "confirmed live". It holds the release flow: the readiness check, the pre-publish list for the owner, the live check afterwards, and the exact status wording. The plugin never publishes; the owner publishes from Framer.
version: 0.1.0
---

# Release flow

Publishing the live site is the owner's act, from the Framer editor. The plugin prepares, verifies and records. Three moments matter: before the publish, the publish itself, and after it.

## Before: "ready for the owner to publish"

1. **Main is the only branch, or every other branch is accounted for.** Run `skills/framer-site-ops/scripts/branch-status.js`. A branch the session did not create is left alone and named: it may be the owner's editor work or a proof of concept he merges himself.
2. **Readiness.** `framer.agent.publish({ action: "preview" })` once: it publishes nothing and returns the diagnostics (changes, errors, warnings) and the URLs. Blocking errors mean "not ready". Typical warnings: a link inside a link (a Button/Primary instance inside a linked card), a missing variant on a form button.
3. **The batch is complete.** A publish between two steps of a change has put a half-done layout and an older site script live before. Say "safe to publish" only when every step of the batch is on main and read back; otherwise say what is still open.
4. **Write the pre-publish list** in the task list's "Right now" block: what goes live (by page, one line each), what was independently checked, what the owner decided in the editor, and what to look at before publishing (a hero, a video, a form, the header or footer, custom code). Then tell the owner "safe to publish" or "not ready: <reason>".

Things that only go live with a publish, and lag until then: the installed custom-code slot, code files (which are never branched and land on main at once), CMS edits made straight on main. Say so when a check predates the publish.

## After: the live check

1. Note the publish time (the owner's words, or the deployment time from the preview URLs).
2. From the task list, take every item marked "live after the next publish" or "merged to main" and the evidence each review entry promised.
3. Check on the live site, both languages, desktop and phone: fetch the HTML for texts, counts, titles, descriptions, H1s, scripts; screenshot through `readProject` with a `url` and `?cb=1`; fetch slowly, because the CDN sometimes serves a short placeholder page instead of the page (retry until the full page comes back). Routine checks use previews, not the live site, to save the plan's bandwidth; the live check after a publish is the exception.
4. Judge each item: confirmed live; not live yet (the publish predates the merge); wrong (what differs, with evidence).
5. Record: the task list gets the status in the owner's wording; the review log gets one dated "Live check after the publish of <date>" section with each item and its evidence. A wrong item becomes a task-list item in section 2 with a recommendation.

## Status wording

In order: "built on the Framer branch <name>" → "checked on a branch preview" → "merged to main" / "re-read on main" / "the branch is gone" → "done; live after the next publish" → "live since the owner's publish of <date>, checked on the live site" → "confirmed live (<date>)". Never "published" by the plugin.

## Launch (the domain switch)

The handbook's "Handover" chapter holds the launch checklist and the task list's "Before launch" section holds the owner's own list. The plugin can prepare and check every step; connecting the domain, turning indexing on, submitting the sitemap and claiming the site in search and social consoles are the owner's.
