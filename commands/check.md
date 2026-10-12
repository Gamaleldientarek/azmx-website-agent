---
description: After the owner publishes, confirm each pending change on the live site and record it
argument-hint: [page path or "all"]
allowed-tools: Read, Edit, Grep, Bash(node:*), Bash(bash:*), Bash(npx @framer/agent:*), Bash(npx -y @framer/agent:*), WebFetch
---

Verify the live site after a publish and record the result. Scope: **$ARGUMENTS** (default: everything marked "live after the next publish").

Launch the `site-reviewer` agent with this brief, or do it inline when the scope is one page:

1. **List what to check.** From the task list, every item marked "live after the next publish" or "merged to main", with its page, both language paths and what exactly should be visible. From the newest review entries, the evidence each promised (a count, a text, a button, a layout).
2. **Check each one on the live site** (`site.production` in `site-agent.json`): fetch the page's HTML for texts, counts and metadata (fetch slowly and re-fetch when the CDN serves a short placeholder). For layout, open or reuse a session (`bash "${CLAUDE_PLUGIN_ROOT}/scripts/framer-session.sh"` prints the id), then for each page set `state.settings = { url: "<full production url>?cb=1", phone: true }` with `exec -s <id> -e '…'` and run `npx -y @framer/agent@latest exec -s <id> < "${CLAUDE_PLUGIN_ROOT}/skills/framer-site-ops/scripts/screenshot.js"`: one run returns the desktop shot and the 390×844 phone shot. `publish-info.js` in the same folder gives the publish time. Arabic at `/`, English at `/en/`. If the HTML fetch is refused (a cloud environment without the site's domains), do the layout checks through the screenshots and report every HTML-based check as not run.
3. **Judge each item**: confirmed live, not live yet (the publish predates the merge, or the change is on a branch), or wrong (describe what differs, with the evidence).
4. **Record.** In the task list, change each confirmed item's status to the file's own wording for "confirmed live" with the date. In the review log, add one dated section at the top: "Live check after the publish of <date>", listing each item and its result, and every finding with its evidence. Do not change any wording the owner wrote; only add the status and the entry.
5. **Report** in three lines: confirmed, not yet live, wrong (with what to do about each).

Never change the Framer project in a check. A finding that needs a fix becomes a task-list item in section 2, with the recommendation.
