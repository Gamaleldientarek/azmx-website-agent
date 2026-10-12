# Using the agent from a cloud session

A cloud session runs on Anthropic's servers instead of a laptop. It clones the website repository from GitHub and keeps working when the laptop is closed. To edit the Framer project from there, the environment needs an API key; the browser sign-in the Framer tool uses on a laptop cannot work in the cloud.

## 1. Create a Framer API key

1. Open the project in Framer.
2. *Site Settings › General*, scroll to **API Keys**, create a key. Name it after its use (for example "Claude cloud") so it can be revoked on its own.
3. Copy the key once. It goes into the environment settings below and nowhere else.

## 2. Set up the cloud environment

In the environment settings (claude.ai/code or the desktop app, the cloud button above the message box):

**Network access:** *Custom*, tick the default list of package managers, and add:

```text
framer.com
*.framer.com
framerusercontent.com
*.framerusercontent.com
github.com
raw.githubusercontent.com
```

Add `framer.website`, `*.framer.website`, `framer.app` and `*.framer.app` as well (and the final domain once the site moves to it): `/azmx-site:check`, the reviewer's HTML checks on the live site, checks of branch previews, the crawler and click tests all read the site through the session's own network. Screenshots through the Framer agent's `readProject` are the one thing that works without them, because Framer takes the screenshot.

**Environment variables:**

```text
FRAMER_API_KEY=the key
```

Anyone who uses the environment can read its variables, so keep the environment personal.

**Setup script:**

```bash
#!/bin/bash
# Install the website agent plugin and sign the Framer agent in to the project.
claude plugin marketplace add Gamaleldientarek/azmx-website-agent || echo "azmx-site: marketplace add failed (is the repository public, and github.com in the allow-list?)" >&2
claude plugin install azmx-site@azmx-website-agent || echo "azmx-site: plugin install failed; in the session run /plugin marketplace add Gamaleldientarek/azmx-website-agent then /plugin install azmx-site@azmx-website-agent" >&2
if [ -n "$FRAMER_API_KEY" ] && [ -f site-agent.json ]; then
  PROJECT_ID="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("site-agent.json","utf8")).framer.projectId)')"
  npx -y @framer/agent@latest project auth "$PROJECT_ID" "$FRAMER_API_KEY" >/dev/null 2>&1 || true
  npx -y @framer/agent@latest setup >/dev/null 2>&1 || true
fi
```

## 3. First message in the session

Run `/azmx-site:setup`. It checks the environment, confirms the sign-in, opens a session and reports the active branch. If `/azmx-site:setup` is not recognised, the plugin did not install: check the setup script's log, then run `/plugin marketplace add Gamaleldientarek/azmx-website-agent` and `/plugin install azmx-site@azmx-website-agent` in the session. If setup says Framer is "waiting for authorization in browser", the key is missing or wrong in the environment settings (setup already ran the sign-in script): set `FRAMER_API_KEY` there, start a new session and run `/azmx-site:setup` again. Never ask for the key in the chat.

## Limits of a cloud session

- No Framer editor and no browser. A visual check that needs the editor is the owner's; layouts can be checked with `framer.agent.readProject` screenshots, which accept a phone viewport. HTML checks need the site's domains in the allow-list; without them the check reports them as not run.
- Only files committed to GitHub are present. Large assets kept out of the repository are not.
- Personal settings and skills from the laptop do not carry over. The repository's rules file and this plugin are what the session has.

## Revoking

Delete the key in Framer, remove the variable from the environment. Nothing else holds it.
