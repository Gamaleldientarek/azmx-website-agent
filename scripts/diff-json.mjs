#!/usr/bin/env node
// Compares two JSON files (a backup and a read-back from serialize-nodes.js or serialize-collection.js) and prints every differing value.
// Usage: node scripts/diff-json.mjs <before.json> <after.json> [--max 300]
import fs from 'node:fs';
const [a, b] = process.argv.slice(2).filter(x => !x.startsWith('--'));
const maxIdx = process.argv.indexOf('--max');
const max = maxIdx > 0 ? Number(process.argv[maxIdx + 1]) : 300;
if (!a || !b) { console.error('Usage: diff-json.mjs <before.json> <after.json>'); process.exit(2); }
const load = p => { const j = JSON.parse(fs.readFileSync(p, 'utf8')); return j.nodes ?? j.items ?? j; };
function flatten(value, prefix, out) {
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
    else for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else out[prefix] = value;
  return out;
}
const before = flatten(load(a), '', {}), after = flatten(load(b), '', {});
const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
const changes = [];
for (const k of keys) if (before[k] !== after[k]) changes.push({ k, before: before[k], after: after[k] });
console.log(`${changes.length} differing value(s) between ${a} and ${b}`);
for (const c of changes.slice(0, max)) console.log(`${c.k}: ${JSON.stringify(c.before)} -> ${JSON.stringify(c.after)}`);
if (changes.length > max) console.log(`… and ${changes.length - max} more (use --max)`);
process.exit(changes.length ? 1 : 0);
