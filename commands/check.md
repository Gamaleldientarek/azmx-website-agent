---
description: After the owner publishes, confirm each pending change on the live site and record it
argument-hint: [page path or "all"]
allowed-tools: Read, Edit, Grep, Bash(node:*), Bash(bash:*), Bash(npx @framer/agent:*), Bash(npx -y @framer/agent:*), WebFetch
---

Verify the live site after a publish and record the result. Scope: **$ARGUMENTS** (default: everything marked "live after the next publish").

Launch the `site-reviewer` agent with this brief, or do it inline when the scope is one page:

1. **List what to check.** From the task list, every item marked "live after the next publish" or "merged to main", with its page, both language paths and what exactly should be visible. From the newest review entries, the evidence each promised (a count, a text, a button, a layout).
2. **Check each one on the live site** (`site.production` in `site-agent.json`): fetch the page's HTML for texts, counts and metadata; take screenshots through the Framer agent's `readProject` with a `url` (desktop, and a 390×844 phone viewport) for layout; add a throwaway parameter (`?cb=1`) to defeat the cache. Arabic at `/`, English at `/en`.
3. **Judge each item**: confirmed live, not live yet (the publish predates the merge, or the change is on a branch), or wrong (describe what differs, with the evidence).
4. **Record.** In the task list, change each confirmed item's status to the file's own wording for "confirmed live" with the date. In the review log, add one dated section at the top: "Live check after the publish of <date>", listing each item and its result, and every finding with its evidence. Do not change any wording the owner wrote; only add the status and the entry.
5. **Report** in three lines: confirmed, not yet live, wrong (with what to do about each).

Never change the Framer project in a check. A finding that needs a fix becomes a task-list item in section 2, with the recommendation.
