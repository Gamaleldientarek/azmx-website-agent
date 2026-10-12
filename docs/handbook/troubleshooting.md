# Troubleshooting

| What you see | What it means | What to do |
|---|---|---|
| `session new` prints "Waiting for authorization in browser" in a cloud session | The Framer tool wants a browser sign-in, which the cloud cannot complete. | Set `FRAMER_API_KEY` in the environment settings, start a new session, run `/azmx-site:setup` (it runs the plugin's sign-in script). On a laptop, let the browser sign-in finish instead. |
| "Could not find an installed framer skill" | The Framer skill was not installed on this machine. | `npx -y @framer/agent@latest setup`, or run `/azmx-site:setup` again (it runs setup). |
| The first `npx` call hangs | npx is waiting on its install prompt. | Always pass `-y` and close stdin: `npx -y @framer/agent@latest … </dev/null`. |
| `applyChanges` reports "target does not exist" | The session has not read that node or variable yet. | Serialize the page or the nodes in the same run, then write. |
| `applyChanges` returned without throwing but nothing changed | The result carried `errors`. | Check `result.errors` after every call. |
| A stopped tool call, but the change appeared anyway | A long `exec` kept running after the stop. | Re-read the branch and the nodes before assuming nothing changed. |
| A write on main produced a branch with a random name | Auto-branching. | Rename it after the task; merge to main when done. |
| A copied node lost its phone layout | `DUPE` keeps desktop, small desktop and tablet, not phone overrides. | Reapply the phone overrides. |
| An option rule never matches on the live site | The rule was written with case names; the runtime holds case ids. | Rewrite the rule with ids. |
| A screenshot shows an old state | The screenshot tool cached that address. | Add a throwaway parameter (`&cb=1`). |
| The editor preview does not show a custom-code behaviour | The editor preview does not run site custom code. | Test on a branch preview or the live site. |
| The publish guard blocked a command | The command looked like a publish, or fed the Framer agent a script the guard could not read. | A bare `{ action: "preview" }` only reports readiness and publishes nothing. For a branch preview run `skills/framer-site-ops/scripts/branch-preview.js` on a branch (preview, then `confirm_publish`; it refuses on main). Feed scripts with `< file` from the repository root or a quoted heredoc. Production is the owner's. |
| The secrets guard blocked a write | The text contained something that looks like a key. | Keep the value in the environment; write its name, not its value. |
| The doctor says `site-agent.json` is missing | The working directory is not the website repository, or the file was never created. | `cd` into the repository, or copy `site-agent.example.json` to its root and fill it in. |
| `/en` content looks mirrored on the canvas | Design pages render right to left. | For English: reverse side-by-side order, align stacks to the end, align text left. |
| An API method's shape differs from the cheat sheet | The Framer agent updated. | `npx -y @framer/agent@latest docs <Name>` prints the current signature; `session new` regenerates the project prompt files. |
