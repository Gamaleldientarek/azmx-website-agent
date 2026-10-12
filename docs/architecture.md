# Architecture: public engine, private facts

```
 ┌──────────────────────────────── public ────────────────────────────────┐
 │  azmx-website-agent (this repository, installed as the azmx-site plugin) │
 │                                                                          │
 │   commands/    what a person types   (/azmx-site:ask, :do, :status …)    │
 │   agents/      who does the work     (organizer, guide, builder,         │
 │                                       content, reviewer, scribe)         │
 │   skills/      what they know        (site knowledge map, Framer safe    │
 │                                       ops, standing rules, release flow) │
 │   hooks/       what the code enforces (publish guard, secrets guard,     │
 │                                       session orientation)               │
 │   scripts/     helpers               (auth, session, doctor, secrets)    │
 └───────────────────────────────┬──────────────────────────────────────────┘
                                 │ reads at run time, never copies
 ┌───────────────────────────────▼──────────────────────────────────────────┐
 │  the website repository (private)                                        │
 │   site-agent.json   project id, URLs, where the docs are                 │
 │   docs/website/     the handbook and site map                            │
 │   task.md review.md the task list and the review log                     │
 │   archive/backups/  JSON backups taken before every write                │
 │   CLAUDE.md         the repository's own rules                           │
 └───────────────────────────────┬──────────────────────────────────────────┘
                                 │ @framer/agent CLI, signed in with
                                 │ FRAMER_API_KEY from the environment
 ┌───────────────────────────────▼──────────────────────────────────────────┐
 │  Framer project                                                          │
 │   branch ──backup──write──read back──merge──► main ──► the owner publishes│
 └──────────────────────────────────────────────────────────────────────────┘
```

## Why this split

- **The repository's rules say the website documentation stays private.** A public plugin cannot embed it. Reading it at run time keeps one source of truth and keeps the plugin honest: it answers from the current files, not from a copy that drifts.
- **The engine is reusable.** Another Framer site only needs its own `site-agent.json` and documentation in the same shape. Nothing in the plugin's procedures is specific to one project id.
- **Security can be read, not trusted.** A reviewer can confirm from the code that no key is stored, that a production publish is blocked by a hook, and that every write is preceded by a backup and lands on a branch.

## Who owns what

| Kind of work | Owner | Skill it loads |
|---|---|---|
| A question about how something is built | `site-guide` | `azmx-site-knowledge` |
| Deciding who should do a request, and in what order | `site-organizer` | all four, as a map |
| A change to a page, section, layout, component or style | `site-builder` | `framer-site-ops`, `azmx-site-rules` |
| CMS items and fields, Arabic and English copy, translations | `site-content` | `framer-site-ops`, `azmx-site-rules` |
| Checking the live site after a publish, screenshots, findings | `site-reviewer` | `azmx-site-release`, `azmx-site-knowledge` |
| Keeping the record: task list, review log, backups, handbook refresh | `site-scribe` | `azmx-site-knowledge` |

## The one flow every write follows

1. Read the active branch and the nodes that will change.
2. Save them as JSON in the backups folder, named after the change and the date.
3. Write on a branch (a write on main creates one; rename it after the task).
4. Read back on the branch and compare with the intent.
5. Merge to main, confirm the branch is gone, re-read on main in a fresh run.
6. Record it: review log (what, why, evidence), task list (status: done, live after the next publish).
7. The owner publishes. A later session confirms it live and records that too.
