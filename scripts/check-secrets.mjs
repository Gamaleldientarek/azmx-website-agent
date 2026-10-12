#!/usr/bin/env node
// Scans files for anything that looks like a credential. Exit 1 when something is found.
// Usage: node scripts/check-secrets.mjs [path ...]      (default: the git-tracked and staged files of the current repository)
//        git diff --cached --name-only | node scripts/check-secrets.mjs --stdin
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { findSecret } from '../hooks/scripts/lib.mjs';

const args = process.argv.slice(2);
let files = [];
if (args.includes('--stdin')) {
  files = fs.readFileSync(0, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
} else if (args.length) {
  for (const a of args) files.push(...walk(a));
} else {
  try {
    files = execSync('git ls-files -z --cached --others --exclude-standard', { encoding: 'utf8' }).split('\0').filter(Boolean);
  } catch { files = walk('.'); }
}
function walk(p) {
  if (!fs.existsSync(p)) return [];
  const st = fs.statSync(p);
  if (st.isFile()) return [p];
  const out = [];
  for (const name of fs.readdirSync(p)) {
    if (['.git', 'node_modules', '.DS_Store'].includes(name)) continue;
    out.push(...walk(path.join(p, name)));
  }
  return out;
}
const SKIP = /\.(png|jpe?g|gif|webp|mp4|mov|pdf|woff2?|ttf|otf|zip|ico)$/i;
let bad = 0;
for (const f of files) {
  if (SKIP.test(f) || !fs.existsSync(f) || fs.statSync(f).size > 5_000_000) continue;
  const text = fs.readFileSync(f, 'utf8');
  const hit = findSecret(text);
  if (hit) { bad++; console.log(`${f}: looks like a ${hit.name} (${hit.sample})`); }
}
if (bad) { console.error(`${bad} file(s) look like they hold a credential. Remove it and keep the value in the environment or the owner's secrets folder.`); process.exit(1); }
console.log(`No credentials found in ${files.length} file(s).`);
