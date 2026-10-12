# The safe working method

Every change to the Framer project follows the same seven steps. The agents follow them, and a person working by hand can follow them too. The point is that the live site never changes by accident, every change can be undone, and the record explains why it happened.

## 1. Know where you are

Open a session (`/azmx-site:setup` or `scripts/framer-session.sh`) and read the active branch **in the same run** as every read and write:

```js
const branch = await framer.agent.getActiveBranch();
```

Finished work belongs on main. If a branch is open, find out why before touching it: someone may be mid-task, or it may be a proof of concept the owner wants to merge himself.

## 2. Read the live state, not the memory

The owner edits in Framer directly. Before changing a node, read it now: `framer.agent.serialize`/`serializeNodes` or `getNode` with `{ pagePath }` for the nodes (serialize the page node with a `depth` to read a whole page). `readProject` only takes screenshots, guides and font searches: use it for a picture of the page, not its state. Keep his wording and layout changes. Never write from an older snapshot, a backup or a transcript.

## 3. Back up

Serialize the nodes that will change and save them as JSON in the backups folder, named `backup-<what>-<date>.json`. The backup is the undo. The script `skills/framer-site-ops/scripts/serialize-nodes.js` prints the read as JSON; redirect it into the backups folder.

## 4. Write on a branch

A canvas write on main creates a branch when auto-branching is on (it has on this project every time; the branch check is the proof); rename it after the task (`renameBranch`). Keep writes small: one `SET` per `applyChanges` call for multi-line text on breakpoint replicas, and check `result.errors` after every call, not only exceptions.

## 5. Read back

Serialize the same nodes on the branch and compare with the intent: text, breakpoints (desktop, small desktop, tablet, phone), both languages. For visual changes, take screenshots with `readProject` (`type: "screenshot"`, a phone viewport of 390×844 for the phone). A branch preview lets you screenshot the real site code without touching the live site: `framer.agent.publish({ action: "preview" })` only returns readiness and a `confirmationHash`; `confirm_publish` with that hash, run on a branch, builds the preview. Use `skills/framer-site-ops/scripts/branch-preview.js`, which does both and refuses to run on main.

## 6. Merge to main

`mergeBranch("main")`, then confirm the branch has disappeared from `getBranches()`, then re-read the nodes on main in a new run. Only then is the work "done".

## 7. Record

- **Review log** (`docs.review` in `site-agent.json`): a dated section at the top: what changed, why, the evidence (node ids, screenshots, counts), and what the owner must do.
- **Task list** (`docs.tasks`): the task's status in the owner's wording: "done; live after the next publish", "merged to main", "confirmed live".
- **Backups**: the backup file is named in the review entry.

The owner publishes. A later session runs `/azmx-site:check` to confirm the change on the live site and records "confirmed live".

## What never happens

- A production publish from a session. The hook blocks it; the plan never includes it.
- A write without a backup.
- A section, video or asset hidden or removed without a yes.
- A key in a file, a prompt or a log.
