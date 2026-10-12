---
name: framer-site-ops
description: This skill should be used whenever a session is about to read or change the AZM X Framer project through the Framer agent: "edit this section", "change the text on the About page", "add a CMS item", "translate", "move the logo strip", "fix the phone layout", "take a backup", "merge the branch", "preview the branch", "screenshot the live page", "update the custom code", or any `npx @framer/agent` call. It holds the safe working method (session, branch, backup, write, read back, merge, record), the exec scripts that do each step, and the gotchas of the agent API on this site. It complements the official Framer skill; it does not repeat the DSL grammar.
version: 0.1.0
---

# Working on the site through the Framer agent

Use the official Framer skill (`~/.claude/skills/framer/`) for the API and the `applyChanges` grammar; its generated project files under `projects/<projectId>/` are the task map. This skill is the **method** for this site and the lessons learned on it.

## The method, every time

1. **Session.** `bash "${CLAUDE_PLUGIN_ROOT}/scripts/framer-session.sh"` prints the session id. Reuse it for every `exec -s <id>` in the conversation.
2. **Branch, in the same run as the read or write.** `await framer.agent.getActiveBranch()` first, always. Finished work lives on main. A branch left open means someone is mid-task or it is a proof of concept the owner merges himself: find out before touching it. `scripts/branch-status.js` prints both the active branch and the list.
3. **Read live state.** Serialize the nodes now (`framer.agent.serializeNodes({ ids, ancestorPath: true }, { pagePath })`). The owner edits in Framer directly; keep his wording and layout changes.
4. **Back up.** `scripts/serialize-nodes.js` (canvas) or `scripts/serialize-collection.js` (CMS) prints the raw read as JSON; redirect it into the backups folder: `exec -s <id> -e 'state.settings = { ids: [...], pagePath: "/", note: "…" }'`, then `exec -s <id> < serialize-nodes.js > archive/backups/backup-<what>-before-<change>-<date>.json`. Printing keeps the script independent of the exec sandbox's file access. A collection backup holds the default-language values; the other language lives in Localization.
5. **Write on a branch.** A canvas write on main creates a branch when auto-branching is on (it has on this project every time; the `getActiveBranch()` check in step 2 is the proof, not the assumption); rename it after the task with `renameBranch`. Small `applyChanges` calls; check `result.errors` after each (it returns errors without throwing).
6. **Read back on the branch.** Run `serialize-nodes.js` again into a temporary file and compare: `node "${CLAUDE_PLUGIN_ROOT}/scripts/diff-json.mjs" <backup> <readback>`; every differing value must be one the change intended. Check all four breakpoints and both languages. For visuals, `scripts/screenshot.js`; for the real site code, `scripts/branch-preview.js` publishes a **branch preview** (never from main) and prints the URLs to screenshot.
7. **Merge.** `scripts/merge-to-main.js`: merge, confirm the branch is gone from `getBranches()`, then re-read on main in a new run.
8. **Record.** Review log entry (what, why, evidence, backup file), task list status. The owner publishes; `/azmx-site:check` confirms it live later.

Run a script with `npx -y @framer/agent@latest exec -s <id> < "${CLAUDE_PLUGIN_ROOT}/skills/framer-site-ops/scripts/<name>.js"`. The scripts that need inputs read them from `state.settings`, set in the same session right before: `exec -s <id> -e 'state.settings = { … }'` (each script's header shows its fields); they refuse to run without it and clear it after reading, so nothing in the installed plugin is edited and a second run cannot reuse the previous ids. The exec sandbox can only write under the current directory, `/tmp` and `os.tmpdir()`, so run from the website repository root and prefer printing to redirecting.

## Publishing

`framer.agent.publish` has three actions. `{ action: "preview" }` changes nothing: it returns readiness, URLs and a `confirmationHash`. `confirm_publish` publishes; on a branch that is a branch preview, on main it is the live site. `deploy_to_production` deploys to the production domain. **Only the owner publishes the live site.** The plugin's hook blocks `confirm_publish` except inside `scripts/branch-preview.js`, which refuses to run on main, and blocks `deploy_to_production` always. Never plan a publish; plan "merged to main, ready for the owner to publish".

## Gotchas that cost time on this site

**Writes**
- `applyChanges` reports "target does not exist" for any node or variable the session has not read. Serialize first, in the same run.
- One `SET` per `applyChanges` call for multi-line text on breakpoint replicas.
- A text style preset cannot be combined with `letterSpacing`, `textTransform` or `textDecoration`: detach it (`textStylePreset="null"`) and set the font values directly.
- To unset: `maxWidth="null"` works, but `zIndex` needs `zIndex=null` without quotes.
- `DUPE <id> newId="<tmp>" parent="<id>" index="<n>";` keeps desktop, small desktop and tablet, and loses phone overrides: reapply them. Each temporary id must be new within the session.
- Image masks: send `masks.0.mask`, `masks.0.maskMode` and `masks.0.maskResize` together in one `SET`; a mask alone drops the mode and resize.
- `formButtonPendingVariant="null"` alone is refused; send it with `formButtonSuccessVariant` in the same `SET`.
- A stopped long `exec` may still finish in the background. Re-read before assuming nothing changed.

**Layout**
- CMS card lists: Fit grid rows, masonry off; `height="1fr"` cards are refused in a Fit grid. Single-row static grids take Auto rows.
- Horizontal scrolling: `overflowX="auto"` is refused; use `overflow="auto"` with `hideScrollbars="true"`.
- Design pages render right to left. For English content, reverse side-by-side order, `stackAlignment="end"`, `textAlignment="left"`. New boards report a stale 200 px size until opened in the editor.

**CMS and localization**
- Saving fields on a draft item clears its draft flag: re-read `item.draft` and restore it.
- Option fields are written with the case id (`{ type: "enum", value: "<case id>" }`) and read back as the case name. A new case: `field.addCase({ name })`, then rewrite any `convertFromOption` rule in full.
- `setLocalizationData` with `action: "ignore"` empties the English value. Re-setting an unchanged value does not clear a "needs review" flag.
- `addFields`, `addItems` and `setAttributes` go straight to main (no branch), and so do URL redirects (`addRedirects`; read `getRedirects()` into a backup first; they take effect on the owner's publish). Keep these writes additive; batch `addItems` at about 50 items; the runner has no `process`.
- New CMS fields bind only after a new session (`session new`).

**Variables, clicks, states**
- An option page variable holds the case **id** at runtime. Highlight rules compare ids; a `convertFromOption` written with case names reads fine in the editor and never matches live.
- Frames use `onTap`; component instances use the component's exposed event. Clear filters with `RESET_VARIABLE_VALUES`; `controls.value="null"` stores the text "null".
- `var(--variable-<listId>-item-count)` only works on nodes inside that list.
- Hover: a native gesture variant (`CREATE_VARIANT <tmp> from="<variant id>" gesture="hover";`). Screenshots cannot show gesture variants.
- Address-bound page variables are re-read only after `history.replaceState` followed by a `popstate` event.

**Custom code**
- `getCustomCode` / `setCustomCode({ html, location })` use the plugin's own slot, separate from the owner's Site Settings scripts, which the API can neither see nor restore. Read the slot and append (an empty slot is `null`, not `""`); never overwrite. Site-level tracking and verification scripts (a tag manager and its consent default, a search or social claim tag) are the owner's named entries in Site Settings › Custom Code: re-adding them is his step even when they are missing live, and the plugin never adds a second copy.
- In CSS, tell the languages apart by `html[dir="rtl"]`, not `lang`.
- The editor preview does not run site custom code; test on a branch preview.

**Screenshots and reads**
- `readProject([{ type: "screenshot", id }])` takes an array; the image is `results[0].image_url`. A `url` with `viewport: { width: 390, height: 844 }` gives the phone. The tool caches an address: add `&cb=1`. It does not run page events, so it cannot test clicks.
- Template pages: `pagePath` is `/<path>/:<Collection name>`, e.g. `/services/:Services`.

**Components**
- `+ComponentNode` then a `+FrameNode` primary variant inside; `applyChanges` returns `renamedIds` for every temporary id. Component variables have their own ids (`getNode({ id })`).
- `framer.uploadImage({ image: "data:image/svg+xml;base64,…", name })` returns `{ url }` usable as a fill.

## Cloud sessions

No editor and no browser. Sign in with `FRAMER_API_KEY` (`scripts/framer-auth.sh`); always `npx -y … </dev/null`. Screenshots through `readProject` still work; the live site itself is reachable only if the environment allows its domains. See `docs/handbook/cloud.md`.

## Additional resources

- **`scripts/`**: `branch-status.js`, `serialize-nodes.js`, `serialize-collection.js`, `branch-preview.js`, `merge-to-main.js`, `screenshot.js`, `publish-info.js` (last publish time, publishes nothing); and `${CLAUDE_PLUGIN_ROOT}/scripts/diff-json.mjs` outside the sandbox.
- **`references/procedures.md`**: longer procedures used on this site (CMS imports in batches, localization passes, custom code slots, component edits, proof-of-concept branches, design directions, site scripts).
- **`references/api-cheatsheet.md`**: the agent methods this site uses, with signatures and return shapes.
- **`references/gotchas-from-the-record.md`**: every lesson the review log and task list recorded, by theme.
