---
description: Answer a question about how the website is built, from its documentation, with the file cited
argument-hint: <question>
allowed-tools: Read, Grep, Glob, Bash(node:*)
---

Answer this question about the website from the repository's documentation: **$ARGUMENTS**

Use the `azmx-site-knowledge` skill: it says where every kind of fact lives and how to search. In short:

1. Resolve the paths with `node "${CLAUDE_PLUGIN_ROOT}/scripts/site-config.mjs"` (handbook, site map, task list, review log, history, plans, code, extra docs).
2. Pick the sources by the kind of question: *how is X built* → the handbook's "Page by page", "CMS", "Components", "Code" chapters and the site map; *why does list Y show these items* → the handbook's CMS chapter and the site map's list rules; *what is the status of Z* → the task list (sections 1 and 2) then the review log's newest entries; *what happened to W* → the review log, then the history log; *how do I do V* → the handbook's "How-to recipes"; *what went wrong before* → "Known issues" and the review log.
3. Grep the sources for the words in the question and their Arabic or English equivalents, read the matching sections in full, and read the nearest headings for context.
4. Answer in the first sentence. Then the supporting facts, each with its source as `path:line` or `path › heading`. Separate what the documents state from what is inferred. If the documents do not answer, say so, name the closest thing they do say, and suggest where the fact could be confirmed (the Framer project, the live site, the owner).
5. For a "how do I" question, give the steps as the handbook gives them, then the plugin's safety steps around them (backup, branch, read back, merge, record, the owner publishes) in one line.

Do not read the Framer project or the live site for an `ask`; this command answers from the record. If the person needs the live state, point them to `/azmx-site:status` or `/azmx-site:check`. Keep the answer short: a reader who knows the site should get the fact in the first line and the evidence under it.
