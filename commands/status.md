---
description: Where things stand: the active Framer branch, what waits on the owner, what waits for a publish
allowed-tools: Read, Grep, Bash(node:*), Bash(bash:*), Bash(npx @framer/agent:*), Bash(npx -y @framer/agent:*)
---

Report where the website work stands, in this order, each as one or two lines:

1. **Framer.** Open or reuse a session (`bash "${CLAUDE_PLUGIN_ROOT}/scripts/framer-session.sh"`) and run `"${CLAUDE_PLUGIN_ROOT}/skills/framer-site-ops/scripts/branch-status.js"` through `exec`. Report the active branch and any other branches. A branch other than main means unfinished or proof-of-concept work: name it and do not touch it. If Framer cannot be reached, say so and continue with the record.
2. **Waiting on the owner.** From the task list (section "waiting on" the owner): the items, one line each, with the recommendation the file gives.
3. **Done, not yet live.** Every task marked "live after the next publish" or "merged to main", grouped by page.
4. **In progress or next.** The task list's "after your input" and "Next" items, the top five.
5. **Newest record.** The first entry of the review log: its date, title and the one-line gist.
6. **Health.** `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs"`: only the `FAIL` and `warn` lines, if any.

Paths come from `site-agent.json` (`node "${CLAUDE_PLUGIN_ROOT}/scripts/site-config.mjs"`). Read, do not change anything. End with the one action that would move things most (usually: the owner publishes, or a decision from section 2).
