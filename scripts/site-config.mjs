#!/usr/bin/env node
// Prints the resolved site-agent.json (plus site-agent.local.json overrides) as JSON, or a field with --get a.b.c.
// Usage: node scripts/site-config.mjs [--get framer.projectId] [--root <dir>]
import { findSiteConfig } from '../hooks/scripts/lib.mjs';

const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const start = rootIdx >= 0 ? args[rootIdx + 1] : (process.env.CLAUDE_PROJECT_DIR || process.cwd());
const site = findSiteConfig(start);
if (!site) {
  console.error('No site-agent.json found above ' + start + '. Copy site-agent.example.json from the plugin into the website repository root and fill in the Framer project id.');
  process.exit(2);
}
const getIdx = args.indexOf('--get');
if (getIdx >= 0) {
  const key = args[getIdx + 1];
  if (!key || key.startsWith('--')) { console.error('Usage: node scripts/site-config.mjs --get <a.b.c> [--root <dir>]'); process.exit(2); }
  const value = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), site.config);
  if (value === undefined) { console.error('Not set: ' + key); process.exit(3); }
  process.stdout.write(typeof value === 'string' ? value : JSON.stringify(value));
} else {
  process.stdout.write(JSON.stringify({ root: site.root, configPath: site.path, ...site.config }, null, 2) + '\n');
}
