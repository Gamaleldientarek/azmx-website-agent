// Framer exec script: print the nodes that will change (or were changed) as JSON, for a backup or a read-back.
// Settings come from `state.settings`, set in the same session right before this script runs, so nothing in the
// installed plugin is edited and a second run cannot silently reuse the previous ids:
//   npx -y @framer/agent@latest exec -s <id> -e 'state.settings = { ids: ["<node id>", "<node id>"], pagePath: "/", note: "what-before-change" }'
//   backup:    npx -y @framer/agent@latest exec -s <id> < serialize-nodes.js > archive/backups/backup-<what>-before-<change>-<date>.json
//   read-back: npx -y @framer/agent@latest exec -s <id> < serialize-nodes.js > /tmp/readback.json
//              node "$CLAUDE_PLUGIN_ROOT/scripts/diff-json.mjs" archive/backups/<backup>.json /tmp/readback.json
// Template pages read as "/services/:Services". Printing (not writing) keeps the script independent of the exec sandbox's file access.
const SETTINGS = state.settings;
if (!SETTINGS || !Array.isArray(SETTINGS.ids) || !SETTINGS.ids.length || SETTINGS.ids.some(i => /^<|>$/.test(String(i))) || !SETTINGS.pagePath) {
  throw new Error('Set state.settings first: exec -s <id> -e \'state.settings = { ids: ["<node id>"], pagePath: "/", note: "<what>-before-<change>" }\'');
}
delete state.settings;
const branch = await framer.agent.getActiveBranch();
const nodes = await framer.agent.serializeNodes({ ids: SETTINGS.ids, ancestorPath: true }, { pagePath: SETTINGS.pagePath });
state.lastSerialized = { ids: SETTINGS.ids, pagePath: SETTINGS.pagePath, branch };
console.log(JSON.stringify({ note: SETTINGS.note || '', takenAt: new Date().toISOString(), branch, pagePath: SETTINGS.pagePath, ids: SETTINGS.ids, nodes }, null, 1));
