# AZM X Website Agent

A public plugin for [Claude Code](https://claude.com/claude-code) that turns any Claude session, on a laptop or in the cloud, into the AZM X website's own agent. The site is built in Framer, Arabic first with an English mirror. Installed next to the website's private repository, the plugin can:

- **Answer anything about the site** from its documentation and record: how a page, list, component, form or script is built, why a list shows what it shows, what the status of a task is, what changed and why. Every answer cites the file.
- **Guide a person through a change**: the steps in Framer, the editor-only steps the owner must take, what to check, what to record.
- **Make the change itself** through the official Framer agent, with a Framer API key: backup first, on a branch, read back, merged to main, recorded. It never publishes; the owner publishes.
- **Route a request**: an organizer reads "I need to…" and names the owner, the steps, the brief and the decisions.

Public engine, private facts: this repository holds procedures, rules and scripts. The website's handbook, task list and review log stay in the private website repository, and the plugin reads them at run time. No key, no identifier of value, no content from the site lives here. See [SECURITY.md](SECURITY.md) and [docs/architecture.md](docs/architecture.md).

## Install

In Claude Code, from the website repository:

```text
/plugin marketplace add Gamaleldientarek/azmx-website-agent
/plugin install azmx-site@azmx-website-agent
```

Then `/azmx-site:setup`. It checks the environment, signs in to Framer, opens a session and reports the active branch.

For a cloud environment, the setup script and the network allow-list are in [docs/handbook/cloud.md](docs/handbook/cloud.md). The Framer key goes into the environment variable `FRAMER_API_KEY` and nowhere else.

To try it without installing: `claude --plugin-dir /path/to/azmx-website-agent`.

Contributing to the plugin itself: after cloning, run `git config core.hooksPath .githooks` once so the secrets scan runs before every commit, and `node scripts/test-guards.mjs` to run the hook tests.

## What the website repository needs

One file at its root, `site-agent.json`: the Framer project id, the site URLs, the languages, and where the documents are. Copy [site-agent.example.json](site-agent.example.json) and fill it in; [site-agent.schema.json](site-agent.schema.json) is the schema. The documents it points to are the handbook (Markdown), the generated site map, the task list, the review log, the backups folder and the rules file.

## Commands

| Command | What it does |
|---|---|
| `/azmx-site:setup` | Environment check, Framer sign-in, session, active branch, orientation. |
| `/azmx-site:ask <question>` | Answers from the documentation and record, with the file cited. |
| `/azmx-site:do <request>` | Routes the request: owner, steps, brief, decisions. Add `--run` to execute the chain. |
| `/azmx-site:status` | The active branch, what waits on the owner, what is built but not live, the newest record entry. |
| `/azmx-site:check` | After the owner publishes: confirms each pending change on the live site in both languages and records it. |
| `/azmx-site:release` | The pre-publish list for the owner: readiness, what ships, what to look at, what to check after. |
| `/azmx-site:handbook` | Opens the handbook, finds where a topic is documented, or refreshes it after changes. |

## Agents

| Agent | Owns |
|---|---|
| `site-organizer` | Routing: what kind of work, who owns it, the brief, the chain. |
| `site-guide` | Questions, diagnosis, how-to steps, editor-only steps written out for the owner. |
| `site-builder` | Canvas changes: pages, sections, layout, components, styles, breakpoints, hover, code, assets. Design directions before a new section. |
| `site-content` | CMS items and fields, imports, Arabic and English copy, translations, SEO text, alt text, glossary. |
| `site-reviewer` | Live checks after a publish, audits on every breakpoint and language, second looks before a merge. |
| `site-scribe` | The record: the task list's "Right now" block, review entries, plans, backups, the handbook refresh. |

## Skills

Knowledge that loads itself when a task matches:

- `azmx-site-knowledge`: where every kind of fact lives in the website repository, how to search and cite, how the record is kept, how the handbook is refreshed.
- `framer-site-ops`: the safe method with the Framer agent (session, branch, backup, write, read back, merge, record), the reusable exec scripts, the API cheat sheet, the procedures used on this site, and every gotcha the record holds.
- `azmx-site-rules`: the owner's standing rules (publishing is his, template sections stay, dark heroes, no stretching, native first, references before a new section) and the Arabic writing rules.
- [`azmx-site-release`](skills/azmx-site-release/SKILL.md): readiness, the pre-publish list, the live check, the status wording.

## Safety rails the code enforces

- **No production publish.** A `PreToolUse` hook blocks `confirm_publish`, `deploy_to_production` and `framer.deploy` in the command text, in scripts fed to the Framer agent from files, and in local scripts the command runs; it fails closed when an exec's code is out of its sight. The sanctioned branch-preview script, which refuses to run on main, is the one way through. A bare `{ action: "preview" }` passes; it publishes nothing. It guards against mistakes; it is not a sandbox (see SECURITY.md).
- **No key in a file.** A hook refuses any write that contains what looks like a credential; an opt-in pre-commit hook and the CI workflow scan the repository.
- **Orientation at session start.** One line: the site, the project, the publish policy, whether a key is present (never its value), and the docs found.

`/azmx-site:status` reports the environment doctor's `FAIL` and `warn` lines. To run it by hand from the website repository: `node "$CLAUDE_PLUGIN_ROOT/scripts/doctor.mjs"` inside a Claude session, or `node /path/to/azmx-website-agent/scripts/doctor.mjs` from a shell whose working directory is the website repository (it finds `site-agent.json` by walking up from the working directory, or from `CLAUDE_PROJECT_DIR`).

## Handbook pages in this repository

- [The safe working method](docs/handbook/working-method.md)
- [The release flow](docs/handbook/release.md)
- [Using the agent from a cloud session](docs/handbook/cloud.md)
- [Troubleshooting](docs/handbook/troubleshooting.md)
- [Questions the team asks, and where the answers live](docs/faq.md)
- [Architecture](docs/architecture.md)

## Evals

`claude plugin eval . --scaffold --allow-tools "Bash(node:*)"` runs the cases in [evals/](evals/README.md) against a small fixture repository modelled on the real one's layout (invented numbers, no ids or hostnames): the guide answers from the handbook and cites it, the organizer routes each kind of request to its owner, a request to hide a section is returned as a decision, "publish now" never calls a publish, and Arabic copy follows the rules. `node scripts/test-guards.mjs` checks the two hooks against crafted inputs without any model.

## Using it for another Framer site

Nothing in the procedures is tied to one project. Give the other site its own `site-agent.json` and documents in the same shape (a handbook, a site map, a task list, a review log, a backups folder), and the same plugin serves it. The rules skill is the only part written for the AZM X site's owner; replace it for another site.

## Licence

MIT. See [LICENSE](LICENSE).
