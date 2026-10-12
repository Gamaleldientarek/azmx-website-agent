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

Add `framer.website`, `*.framer.website`, `framer.app` and `*.framer.app` only when a session must open the live site itself (for click tests). Screenshots through the Framer agent do not need them.

**Environment variables:**

```text
FRAMER_API_KEY=the key
```

Anyone who uses the environment can read its variables, so keep the environment personal.

**Setup script:**

```bash
#!/bin/bash
# Install the website agent plugin and sign the Framer agent in to the project.
claude plugin marketplace add Gamaleldientarek/azmx-website-agent >/dev/null 2>&1 || true
claude plugin install azmx-site@azmx-website-agent >/dev/null 2>&1 || true
if [ -n "$FRAMER_API_KEY" ] && [ -f site-agent.json ]; then
  PROJECT_ID="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("site-agent.json","utf8")).framer.projectId)')"
  npx -y @framer/agent@latest project auth "$PROJECT_ID" "$FRAMER_API_KEY" >/dev/null 2>&1 || true
  npx -y @framer/agent@latest setup >/dev/null 2>&1 || true
fi
```

## 3. First message in the session

Run `/azmx-site:setup`. It checks the environment, confirms the sign-in, opens a session and reports the active branch. If it says Framer is "waiting for authorization in browser", the key did not take effect: run the auth script again (`bash "$CLAUDE_PLUGIN_ROOT/scripts/framer-auth.sh"`) and retry. If that fails too, the key is wrong or missing in the environment; ask the owner to check it there. Never ask for the key in the chat.

## Limits of a cloud session

- No Framer editor and no browser. A visual check that needs the editor is the owner's; everything else can be checked with `framer.agent.readProject` screenshots, which accept a phone viewport.
- Only files committed to GitHub are present. Large assets kept out of the repository are not.
- Personal settings and skills from the laptop do not carry over. The repository's rules file and this plugin are what the session has.

## Revoking

Delete the key in Framer, remove the variable from the environment. Nothing else holds it.
