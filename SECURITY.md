# Security

This plugin is public so that anyone who installs it can read exactly what it does. This page is the trust model: what the plugin holds, what it never does, and how to revoke its access.

## What the plugin holds

- Procedures, rules, prompts and small helper scripts. All of it is in this repository.
- No key, no token, no account id, no tracking id. The `scripts/check-secrets.mjs` scan runs on every commit once a clone has enabled the hook (`git config core.hooksPath .githooks`, one command, per clone) and on every push and pull request in GitHub Actions (`.github/workflows/check.yml`), and a `PreToolUse` hook refuses to write anything that looks like a credential into a file during a session.
- No content from the website repository. The handbook, task list and review log stay in that private repository. The plugin reads them at run time, on the machine where both are installed, and never copies them anywhere. The one exception is the eval fixture (`evals/fixtures/site/`), a small repository modelled on the real one's layout and naming, with invented numbers and no hostnames, ids, secrets or copy.

## How access to Framer works

- The plugin talks to Framer only through the official `@framer/agent` command line tool, the same tool the Framer skill uses.
- The sign-in is either the tool's own browser sign-in (on a laptop) or a Framer **API key** from the environment variable `FRAMER_API_KEY` (in a cloud environment). The key is created in Framer under *Site Settings › General › API Keys*, scoped to one project, and named so it can be revoked alone.
- `scripts/framer-auth.sh` passes the key to `npx @framer/agent@latest project auth` with its output hidden. The key is never echoed, logged, written to a file or placed in a prompt.
- The Framer project id in `site-agent.json` is an identifier, not a credential: without a key it grants nothing.

## What the plugin never does

| Never | Enforced by |
|---|---|
| Publish the live site | `hooks/scripts/guard-publish.mjs`: a `PreToolUse` hook on every shell command. It blocks `confirm_publish`, `deploy_to_production`, `framer.deploy` and any CLI publish form, in the command text, in scripts fed to the Framer agent from files, and in local scripts the command runs (one level at a time, up to four). It fails closed when an exec's code is out of sight (an unreadable file, a pipe from anything but `cat <file>`, command substitution) and when `site-agent.json` cannot be read. A bare `{ action: "preview" }` passes (it publishes nothing); so does the sanctioned branch-preview script, which refuses to run on main. The exceptions: the site config says `allow-with-flag` **and** `AZMX_SITE_ALLOW_PUBLISH=1` is set for that command. It is a guard against mistakes, not a sandbox: an installed package script (`npm run …`) or an encoded payload is outside its sight, which is why the agents' instructions and the key policy are separate layers. `scripts/test-guards.mjs` holds the cases it is checked against. |
| Write on Framer's main without a backup | The `framer-site-ops` skill and the builder and content agents: serialize the nodes to `archive/backups/` first, write on a branch, read back, then merge. |
| Store or print a key | `guard-secrets.mjs` (writes), `check-secrets.mjs` (commits, once the hook is enabled, and CI), and the auth script's hidden output. |
| Delete or hide the site's sections, videos or assets without a yes | The `azmx-site-rules` skill; the organizer returns such requests as decisions for the owner. |
| Send anything outside the machine except to Framer and GitHub | The plugin has no MCP server and no network code of its own. |

## What a stranger can do with this repository

Read it, install it, and run it against **their own** Framer project with their own key and their own `site-agent.json`. They cannot reach the AZM X project: the project is private in Framer, the website repository is private on GitHub, and no key exists in this repository.

## Revoking access

1. In Framer: *Site Settings › General › API Keys*, delete the key.
2. In the cloud environment: remove `FRAMER_API_KEY`.
3. On a laptop: `npx @framer/agent@latest` keeps its own sign-in; sign out there, or revoke the browser session in Framer.

## Reporting a problem

Open an issue in this repository with the file and line, or write to the owner through the contact details on the repository's profile. Do not include a key, even a revoked one, in the report.
