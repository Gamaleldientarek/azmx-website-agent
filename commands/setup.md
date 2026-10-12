---
description: Check the environment, sign in to Framer with the key, open a session, confirm the docs
argument-hint: [--online]
allowed-tools: Bash(node:*), Bash(bash:*), Bash(npx @framer/agent:*), Bash(npx -y @framer/agent:*), Read, Write
---

Set up this session to work on the website. Do the steps in order and report each result in one line. Never print the value of `FRAMER_API_KEY`, never ask the person to paste a key into the chat, and never write a key into a file.

1. **Find the site config.** Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs"`. If it reports that `site-agent.json` is missing, copy `${CLAUDE_PLUGIN_ROOT}/site-agent.example.json` to the repository root as `site-agent.json`, fill in what the repository's own rules file (CLAUDE.md) states about the Framer project id, the site URLs and the document paths, and run the doctor again. Fix every `FAIL` line before going on; `warn` lines are information.
2. **Sign in to Framer.** Run `bash "${CLAUDE_PLUGIN_ROOT}/scripts/framer-auth.sh"`. With `FRAMER_API_KEY` set it signs in with the key and installs the Framer skill; without it, on a laptop, the first session opens the browser sign-in. If the script says Framer rejected the key, tell the person to check the key in Framer's Site Settings › General › API Keys and in the environment settings, then stop.
3. **Open a session.** Run `bash "${CLAUDE_PLUGIN_ROOT}/scripts/framer-session.sh"` and keep the printed session id for every `npx @framer/agent@latest exec -s <id>` in this conversation. If it says Framer needs a sign-in: on a laptop, run `npx -y @framer/agent@latest project auth <projectId>` (it opens the browser; no key needed) and rerun the script; in a cloud session the environment has no key, so point to `${CLAUDE_PLUGIN_ROOT}/docs/handbook/cloud.md` and stop.
4. **Read the active branch.** Run `npx -y @framer/agent@latest exec -s <id> -e 'console.log(JSON.stringify(await framer.agent.getActiveBranch()))'`. Report the branch name. If it is not the main branch, say so: finished work belongs on main, and someone may have left a branch open on purpose, so do not switch or merge anything in setup.
5. **Load the Framer skill's project files.** Read `~/.claude/skills/framer/projects/<projectId>/index.md` (the task map) and `prompt/critical-reminders.md`. Do not read the other prompt files until a task needs them.
6. **Orient.** Read the first 60 lines of the task list named in `site-agent.json` (`docs.tasks`) and the headings of the review log (`docs.review`). Report in three lines: what is waiting on the owner, what is done but not yet published, and the newest review entry.

If `$ARGUMENTS` contains `--online`, after step 2 run `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" --online` in place of steps 3 and 4; it opens the session and reads the branch.

Finish with one line: what the person can do next (`/azmx-site:ask`, `/azmx-site:do`, `/azmx-site:status`).
