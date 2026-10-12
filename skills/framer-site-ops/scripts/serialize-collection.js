// Framer exec script: print a CMS collection (fields and every item, drafts included) as JSON, for a backup or a read-back.
// The backup holds the default-language values only (fieldData); the other language's values live in Localization and
// need a localization read if they must be restored.
//   npx -y @framer/agent@latest exec -s <id> -e 'state.settings = { collectionName: "<name>", note: "<collection>-before-<change>" }'
//   npx -y @framer/agent@latest exec -s <id> < serialize-collection.js > archive/backups/backup-<collection>-before-<change>-<date>.json
const SETTINGS = state.settings;
if (!SETTINGS || !SETTINGS.collectionName || /^<|>$/.test(SETTINGS.collectionName)) {
  throw new Error('Set state.settings first: exec -s <id> -e \'state.settings = { collectionName: "<name>", note: "<what>-before-<change>" }\'');
}
delete state.settings;
const branch = await framer.agent.getActiveBranch();
const collections = await framer.getCollections();
const collection = collections.find(c => c.name === SETTINGS.collectionName);
if (!collection) throw new Error(`No collection named ${SETTINGS.collectionName}. Found: ${collections.map(c => c.name).join(", ")}`);
const fields = await collection.getFields();
const items = await collection.getItems();
state.lastCollection = { id: collection.id, name: collection.name, fieldIds: Object.fromEntries(fields.map(f => [f.name, f.id])) };
console.log(JSON.stringify({
  note: SETTINGS.note || '', takenAt: new Date().toISOString(), branch,
  collection: { id: collection.id, name: collection.name, managedBy: collection.managedBy },
  fields: fields.map(f => ({ id: f.id, name: f.name, type: f.type, cases: f.cases })),
  items: items.map(i => ({ id: i.id, slug: i.slug, draft: i.draft, fieldData: i.fieldData })),
}, null, 1));
