---
description: The pre-publish list for the owner: what is on main waiting, what to look at, what to check after
allowed-tools: Read, Grep, Bash(node:*), Bash(bash:*), Bash(npx @framer/agent:*), Bash(npx -y @framer/agent:*)
---

Prepare the release list for the owner. The plugin never publishes; this command tells the owner what a publish would ship and what to check after.

1. **Main is the only branch.** Run `"${CLAUDE_PLUGIN_ROOT}/skills/framer-site-ops/scripts/branch-status.js"` through a Framer session. If a branch exists, list it with what it holds (from the task list and review log) and whether it should be merged first, left (proof of concept), or discarded; that is the owner's call.
2. **Readiness.** Run `framer.agent.publish({ action: "preview" })` once through `exec`: it publishes nothing and returns the readiness diagnostics (changes, errors, warnings). Report blocking errors and warnings in plain words.
3. **What ships.** From the task list: every item marked "live after the next publish" or "merged to main", grouped by page, with one line each on what the owner will see. From the review log: the newest entries since the last confirmed publish.
4. **What to look at before publishing**, if anything: changes that touch a hero, a video, a form, the header or footer, or custom code; name the page and the thing to glance at in the editor.
5. **After publishing**: the checks `/azmx-site:check` will run, in one line, so the owner knows what comes next.

Use the `azmx-site-release` skill for the wording of statuses and the order of checks. End with one line: "Ready to publish from Framer" or "Not ready: <reason>".
