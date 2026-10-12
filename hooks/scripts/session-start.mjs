#!/usr/bin/env node
// SessionStart: one short orientation line for the session. Never prints a key.
import fs from 'node:fs';
import path from 'node:path';
import { readStdinJson, findSiteConfig, projectDir } from './lib.mjs';

const { input } = readStdinJson();
const dir = projectDir(input);
const site = findSiteConfig(dir);
const lines = [];
if (!site) {
  lines.push('azmx-site plugin: no site-agent.json found above the working directory. Run /azmx-site:setup to create one from site-agent.example.json, or open the website repository.');
} else {
  const c = site.config;
  const docs = c.docs || {};
  const missing = ['handbook', 'tasks', 'review'].filter(k => docs[k] && !fs.existsSync(path.join(site.root, docs[k])));
  const key = process.env.FRAMER_API_KEY ? 'FRAMER_API_KEY is set' : 'no FRAMER_API_KEY (browser sign-in on a Mac, or set the variable in the cloud environment)';
  lines.push(`azmx-site plugin: ${c.site?.name || 'site'} · Framer project ${c.framer?.projectId || '?'} · publish policy ${c.framer?.publish || 'human-only'} · ${key}.`);
  lines.push(missing.length ? `Missing docs: ${missing.map(k => docs[k]).join(', ')}.` : `Docs found: ${docs.handbook}, ${docs.tasks}, ${docs.review}.`);
  lines.push('Commands: /azmx-site:ask, /azmx-site:do, /azmx-site:status, /azmx-site:check, /azmx-site:release, /azmx-site:handbook, /azmx-site:setup. Rules: backup first, work on a branch, read back, merge to main; the owner publishes.');
}
process.stdout.write(lines.join('\n') + '\n');
