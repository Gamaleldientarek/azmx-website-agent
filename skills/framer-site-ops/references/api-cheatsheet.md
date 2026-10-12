# Framer agent API cheat sheet (what this site uses)

The official Framer skill's generated prompt files are the full reference; `npx -y @framer/agent@latest docs <Name>` prints a method's signature. This sheet lists the calls the site's work uses, with their shapes, so they are not re-discovered each session.

## Session and execution

```bash
npx -y @framer/agent@latest session new <projectId>          # prints a numeric session id; refreshes ~/.claude/skills/framer/projects/<projectId>/
npx -y @framer/agent@latest exec -s <id> < script.js         # run a script; `state` persists between execs; `console.log` is the output
npx -y @framer/agent@latest exec -s <id> -e '<one-liner>'
npx -y @framer/agent@latest docs Collection.getItems
```

Always `-y` and, in non-interactive shells, `</dev/null`. One session per conversation; a replacement session can trigger another auto-branch. `require` loads fs, path, url, crypto, buffer, util, os; file access is sandboxed to the current directory and `/tmp`, so print JSON and redirect rather than relying on writes.

## Branches

| Call | Returns | Notes |
|---|---|---|
| `framer.agent.getActiveBranch()` | `{ id, title, url, baseId?, joined, lastEditedAt? }` | Main has `id: "main"`. Call it in the same run as every read and write. |
| `framer.agent.getBranches()` | `AgentBranch[]` | Mutations take ids, never titles; resolve by `title` first. |
| `framer.agent.createBranch(title?)` | the new branch, now active | Every canvas write on main also auto-creates one; `[FRAMER_BRANCH_CHANGE]` in the output means the active branch changed. |
| `framer.agent.renameBranch(branchId, title)` | void | Rename default adjective-noun branches after the task. |
| `framer.agent.switchBranch(branchId)` / `joinBranch` / `leaveBranch` | void | Join before editing a branch the session did not create (`joined: false`); leave only when asked. |
| `framer.agent.mergeBranch(targetBranchId = base)` | void, switches to the target | A branch with child branches cannot be merged; merge the children first. Confirm with `getBranches()` and a re-read on main. |
| `framer.agent.getBranchChanges(branchId)` | `{ type, … }[]` by page, collection, component, code file, style | What a branch holds before deciding to merge it. |
| `framer.agent.deleteBranch(branchId)` | void | Only on explicit request. |

## Reading

| Call | Use |
|---|---|
| `framer.agent.serialize({ id, depth?, attributeFilter?, ancestorPath? }, { pagePath })` | One node with controlled depth; `ancestorPath: true` for context. |
| `framer.agent.serializeNodes({ ids, depth?, attributeFilter?, ancestorPath? }, { pagePath })` | Several nodes; the backup and read-back read. |
| `framer.agent.getNode({ id })`, `getNodes`, `getNodesOfTypes({ types })`, `getDescendantsOfTypes`, `getParentNode`, `getAncestors`, `getRect` | Tree navigation; component variables come from `getNode` on the component. |
| `framer.agent.readProject(queries, { pagePath? })` | Array of queries, results in order: `{ type: "screenshot", id }`, `{ type: "screenshot", url, viewport?: { width: 390, height: 844 } }` (public URLs only; image at `results[i].image_url`; add `?cb=1` against the cache), `{ type: "implementation-guide-from-index", name }` (19 guides: Analytics, Buttons, CMS Collection Lists, CMS Detail Pages, Computed Values, Cursors, Effects, FAQ, Forms, Grids, Lists, Logos, Masks, Navigations, Overlays, Shaders, Spinners, Tabs and more), `{ type: "font-search", name }`. |
| `framer.getPublishInfo()` | `{ production: { deploymentTime, url, optimizationStatus } \| null, staging: … }`: the last publish, without publishing. |

## Writing

`framer.agent.applyChanges(dsl, { pagePath })`: one page per call; template pages are `/<path>/:<Collection name>`. Commands end with `;`. `+<NodeType> <tmp> attr="v" parent="<id>" index="<n>";` creates; `SET <id> attr="v";` mutates (dotted paths such as `collectionList.filters.0.transforms.0.name`, `masks.0.mask`, `$control__<key>`; unset with `"null"`, except `zIndex=null`); `DEL`, `MOVE`, `DUPE <id> newId="<tmp>" parent="<id>" index="<n>";`, `CREATE_VARIANT <tmp> from="<variantId>" gesture="hover";`. The result carries `parseErrors`, `errors`, `warnings`, `linter` and `renamedIds`; failed commands do not throw. Writes need a read of the target in the same run.

## CMS (plugin API, straight to main)

```js
const c = (await framer.getCollections()).find(c => c.name === "Blog");
const fields = await c.getFields();            // { id, name, type, cases? }
const items = await c.getItems();              // { id, slug, draft, fieldData: { [fieldId]: { type, value } } }
await c.addItems([{ slug, draft: true, fieldData: { [fieldId]: { type: "string", value } },
                    valueByLocale: { [localeId]: { action: "set", value } } }]);   // ~50 per call
await item.setAttributes({ fieldData: {...}, draft: item.draft });                // re-assert draft
await enumField.addCase({ name });            // then rewrite any convertFromOption rule in full
await c.addFields([{ type: "string", name }]); // bind only after a new session
```

Enum values are written as `{ type: "enum", value: "<case id>" }` and read back as names. Images: `{ type: "image", value: url, alt }`. The API cannot delete a collection.

## Localization (plugin API)

```js
const locales = await framer.getLocales();                       // [{ id, code, name, slug }], default excluded
const groups = await framer.getLocalizationGroups({ groupIds });  // sources with their ids
await framer.setLocalizationData({ valuesBySource: { [sourceId]: { [localeId]: { action: "set", value, needsReview } } } });
```

Never `action: "ignore"` on a translated field (it empties the value). The DSL cannot localize.

## Custom code (the plugin's own slot)

```js
const code = await framer.getCustomCode();      // { headStart, headEnd, bodyStart, bodyEnd }: { disabled, html }
await framer.setCustomCode({ html: code.bodyEnd.html + "\n" + block, location: "bodyEnd" });   // read, append, write
```

The owner's Site Settings scripts are invisible to the API; never add a second copy of one.

## Assets and code

`framer.uploadImage({ image: dataUrl, name })` returns `{ url }`; `framer.uploadFile` fails on large data URLs (the owner uploads big files in the CMS). Code files: `framer.getCodeFiles()`, `createCodeFile`, `codeFile.setFileContent` land on main immediately (not branched). Redirects: `framer.getRedirects()`, `addRedirects`.
