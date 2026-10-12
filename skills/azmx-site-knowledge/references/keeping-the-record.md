# Keeping the record

The record is three files and two folders. Every change touches them; a change that is not recorded is not done.

## The task list (`task.md`)

**Sections, by who acts next**

1. *Open: waiting on the owner*: decisions, editor-only steps, files to send, publishing. Opens with a dated "Checked open list" blockquote after each publish check, grouped as "this week", "quick decisions", "waiting on others", "launch day", "checked done". Sub-sections: "Quick steps in Framer" (editor-only controls), "Files and facts to send", "Questions (with a recommendation after each)", "Before launch".
2. *Open: Claude, after your input*: work that runs once the owner answers, plus finished jobs waiting for a publish (one `###` per job), then "Next" (long build logs) and "Parked".
3. *Done*: what went live, by area.
4. *Standing rules*.
5. *Where things are*: a path table, plus long integration logs.

**The "Right now" block** at the top: rewritten when a batch is finished and checked, so the owner reads one paragraph before publishing. It says what goes live with the next publish, what was independently checked, and what the owner decided in the editor. "Safe to publish" is written only when the batch is complete; a publish between two steps of a change has put a half-done layout live before.

**An entry**: a checkbox bullet (`- [ ]` / `- [x]`) or, for a finished job, an `###` heading whose title carries the topic, the date, the requester's words in quotes when there were any, and the status. Sub-bullets in a fixed order: what was wrong or asked → what changed (where, which breakpoints and variants) → the checks (branch preview, read back, re-read on main, test counts) → the backup path → follow-ups split between the owner and Claude.

**Status vocabulary, in order**: "built on the Framer branch <name>" → "checked on a branch preview" → "merged to main" / "re-read on main" / "the branch is gone" → "done; live after the next publish" → "live since the owner's publish of <date>, checked on the live site" → "confirmed live (<date>)". Never "published" by Claude.

**Closing an item**: tick it and prefix the outcome in bold with the date and the owner's quoted words: "**Done (7 Oct, the owner: yes).**", "**Kept (the owner, 7 Oct).**", "**Reverted (8 Oct, …).**", "**Dropped (10 Oct).**". Strike the old question. Keep the newest state first inside an entry; mark older notes "(superseded)".

**Questions to the owner**: one numbered question each, the situation and the trade-off, then one bold **Recommended:** sentence with a single choice. Quick decisions are one line: the facts, then "Keep or replace?", "Pick one.", "Confirm.". Never re-propose a rejected direction. Mark unverified facts ("sample figures", "to confirm") and list missing facts instead of guessing.

## The review log (`review.md`)

Newest first. One dated `##` section per change or finding: `## 11 October 2026: <title in plain words>`. Inside: what changed and why (the request, the owner's words), how (branch name, the exact steps, the API calls that mattered), the evidence (counts, screenshots, read-back results, test runs), the backup file, what the owner must do, and any objection or open question. Findings from checks and audits go here too, with the fix as a task-list item.

## Backups (`archive/backups/`)

`backup-<what>-before-<change>-<YYYY-MM-DD>.json` for canvas nodes, collections, localization and custom code; `<Component>.before-<change>-<date>.tsx` for code files. Each JSON carries a `note`, the `branch`, a timestamp and the raw read. Keep before-and-after pairs for big changes so a check can diff them. Every task-list entry and review section names its backup.

## Plans (`docs/plans/`)

`<topic>-<YYYY-MM-DD>.<ext>` for a single file, `<topic>-<YYYY-MM-DD>/` for a set. A plan opens with an H1, the date and a status line ("Status: awaiting the owner's approval. Nothing is built in Framer yet."). Design directions are HTML boards rendered to JPG; rounds are numbered. When a folder holds only images, the spec and the decision live in the task list and the review log.

## Noise to ignore

Folders named `receipts/` and `review-receipts/` hold tool-signing logs written by a plugin; they are gitignored and never evidence.
