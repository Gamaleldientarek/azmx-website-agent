# Procedures used on this site

Each one assumes the method in `SKILL.md` (session, branch check, backup, write, read back, merge, record). These are the parts specific to the task.

## Import or bulk-update CMS items

1. Back up the collection (`serialize-collection.js` → backups folder). Note the field ids from the output; `state.lastCollection.fieldIds` holds them for the session.
2. Prepare the rows outside Framer (a sheet or JSON). Validate before writing: slugs unique and lower-case, required fields present, both languages present, no English in an Arabic field.
3. Write in batches of about 50 with `addItems`, as drafts when the owner has not approved the content, with `valueByLocale` on each text field entry for the English in the same call. CMS writes go straight to main: there is no branch to discard, so the backup is the only undo.
4. Re-read the collection and count: items added, drafts, empty fields. Re-assert `draft` on anything that was a draft.
5. Record the counts, the backup file and what the owner must still approve or un-draft.

Imports of a few hundred rows were done this way (a glossary in several rounds, articles from a task tracker as drafts, open roles from an HR tracker). A dictionary-style source may need a tab or option case added first: `addCase`, then rewrite the option rule in full.

## A translation pass

1. Read the English and the Arabic of every string in scope from the localization groups (`getLocalizationGroups`), not from memory.
2. Write the Arabic from the meaning, following `azmx-site-rules/references/arabic.md`. Keep exact names (products, programmes) and the positioning line.
3. `setLocalizationData` with `action: "set"`; never `"ignore"`. Changing the Arabic has two effects by source type: canvas text, controls, buttons and links move to a new source with no English; a CMS field keeps its English flagged "needs review". Either way, read the sources back and set the English again (a changed value on a CMS field, since an unchanged one leaves the flag).
4. Read back; then a phone screenshot of the Arabic page and the English page (a branch preview when the change is on a branch).

## A canvas change on a component used everywhere

1. Find the component and its instances (site map › Components; `data/components.json`). Changing a shared component changes every page: say which pages in the record.
2. Edit the component's primary variant; breakpoint replicas and instances inherit. Write the primary only, then read back.
3. Hover: a native gesture variant below its source, overriding only what changes. Taps on phone: variables, not hover variants.
4. Check one instance per page type and the phone before merging.

## Site scripts in the custom-code slot

1. Edit the script in the repository's `code/site-scripts/` (keep its `data-azmx="…"` marker) and run its test (`node code/site-scripts/test-<name>.mjs`), which mocks the forms endpoint and never sends anything.
2. Back up the slots: `framer.getCustomCode()` → `backup-custom-code-before-<change>-<date>.json`.
3. Read the slot, append the block (an empty slot reads as `null`), write it back with `setCustomCode`. Head-end and body-end have an established order; keep it.
4. It goes live with the owner's next publish; re-run the test against the live site then.

## A proof of concept on a branch

1. `createBranch("<topic>-poc")`, build, `branch-preview.js`, screenshot the preview at 1440 and 390.
2. Record the branch name, the preview URL and "Do not merge: the owner merges this branch himself" in the task list.
3. Never merge it. If the owner merges it in the editor, find what changed by diffing main against the backup.

## Design directions before a new section

1. Research references (Craftwork, Mobbin, named sites). Author an HTML board with two or three directions, render it to JPG, save under the plans folder as `<topic>-<date>/`.
2. For a change to an existing live page, show the options as screenshots of the live page with the DOM edited in a local browser, no highlight boxes, at desktop and phone.
3. Put the choice to the owner as one question with a recommendation. Build after the pick; never re-propose a rejected direction.

## Adding something that touches several systems

Adding a service or a report touches the CMS item, the canvas (carousel slides, a stack card, footer and menu entries, a form option) and the forms relay (its own title map, deployed with the owner's yes). The handbook's how-to recipe lists every place; route the relay step to the person who deploys it, and record each part's status separately.

## Undo a change from a backup

There is no restore script; a restore is a change like any other, with the backup as its source of truth.

1. Read the backup (`backup-<what>-before-<change>-<date>.json` named in the review entry) and the live state now (`serialize-nodes.js` into a temporary file); diff them with `diff-json.mjs`. The owner may have edited since, so every differing value is checked against the record before it is touched.
2. On a branch, re-apply the saved values with the same API the write used: canvas attributes as `SET` statements keyed by node id, one `SET` per breakpoint replica the diff lists; a text with a preset through `node.setText()` when a virtual-id `SET` is refused.
3. CMS: the collection backup holds `id`, `slug`, `draft` and `fieldData` in the default language. Restore values with `setAttributes` (enum values are written as case ids, read back as names; re-assert `draft`). The other language is not in the backup: read the localization sources and set them with `setLocalizationData` `action: "set"`, never `"ignore"`.
4. Custom code: the backup holds the slot's `html`; write it back whole with `setCustomCode`.
5. Read back, diff again against the backup (zero differences, or only the ones the owner made since), merge, record the restore and the reason.

## After a stopped tool call

Re-read the active branch and the affected nodes before assuming nothing changed; the script may have finished in the background.
