// Framer exec script: print the nodes that will change (or were changed) as JSON, for a backup or a read-back.
// Edit SETTINGS, then redirect the output into a file:
//   backup:    npx -y @framer/agent@latest exec -s <id> < serialize-nodes.js > archive/backups/backup-<label>-before-<change>-<date>.json
//   read-back: npx -y @framer/agent@latest exec -s <id> < serialize-nodes.js > /tmp/readback.json
//              node "$CLAUDE_PLUGIN_ROOT/scripts/diff-json.mjs" archive/backups/<backup>.json /tmp/readback.json
// Printing instead of writing keeps the script independent of the exec sandbox's file access.
const SETTINGS = {
  ids: ["<node id>", "<node id>"],      // the nodes (page sections, components, templates, variants)
  pagePath: "/",                        // the page they live on; template pages read as "/services/:Services"
  note: "what-before-change",           // one line: what this is and why
};
const branch = await framer.agent.getActiveBranch();
const nodes = await framer.agent.serializeNodes({ ids: SETTINGS.ids, ancestorPath: true }, { pagePath: SETTINGS.pagePath });
state.lastSerialized = { ids: SETTINGS.ids, pagePath: SETTINGS.pagePath, branch };
console.log(JSON.stringify({ note: SETTINGS.note, takenAt: new Date().toISOString(), branch, pagePath: SETTINGS.pagePath, ids: SETTINGS.ids, nodes }, null, 1));
