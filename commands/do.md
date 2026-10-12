---
description: Route a request to the right owner, with the steps and the brief, and run it if asked
argument-hint: <what you need done> [--run]
allowed-tools: Read, Grep, Glob, Bash(node:*), Agent
---

Route this request: **$ARGUMENTS**

Launch the `site-organizer` agent with the request, the repository root and these instructions:

- Classify the request into one kind of work and name the owner (`site-guide`, `site-builder`, `site-content`, `site-reviewer`, `site-scribe`, or the owner himself for a decision), with the skills that owner loads.
- Write the brief: the facts the owner needs verbatim (pages, node names, both languages, breakpoints), the rules that apply, what counts as done, and what to record.
- List the decisions the owner of the site must make before or after, each with a recommendation.
- If `$ARGUMENTS` contains `--run`, run the chain: dispatch the owner agent(s) with the brief, gate each stage, and return the assembled result with every objection carried through. Otherwise return the routing recommendation only (the default: the person reads it, then says "run it").

When the organizer returns, relay its recommendation as it is: owner, steps, brief, decisions. Do not do the specialist work in this command, and do not start a change the person has not asked to run.
