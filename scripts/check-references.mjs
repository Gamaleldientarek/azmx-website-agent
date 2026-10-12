#!/usr/bin/env node
// Every backticked file path in the plugin's Markdown must exist, unless it names a file of the website repository
// (which the plugin reads at run time) or of the Framer skill. Exit 1 on a dangling reference.
// Usage: node scripts/check-references.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBSITE_REPO = /^(site-agent(\.local)?\.json|task\.md|review\.md|CLAUDE\.md|README\.md|handbook\.html|how-to-open\.html|build\.py|pack\.py|crawl\.mjs|capture\.mjs|site-map\.md|index\.md|project-inventory\.md|docs\/.*|data\/.*|archive\/.*|code\/.*|scripts\/README-sync\.md|scripts\/glossary-click-test\.mjs|snapshot\/README\.md|prompt\/.*|[a-z-]+\.json)$/;
const skills = fs.readdirSync(path.join(ROOT, 'skills'));
const mdFiles = [];
(function walk(d) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (n === '.git' || n === 'node_modules' || n === 'results') continue;
    if (fs.statSync(p).isDirectory()) walk(p); else if (/\.md$/.test(p)) mdFiles.push(p);
  }
})(ROOT);
let bad = 0;
for (const f of mdFiles) {
  if (f.includes(path.join('evals', 'fixtures'))) continue;
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(/`([A-Za-z0-9_./<>$-]+\.(?:mjs|cjs|js|sh|json|md|yml|yaml|py|tsx))`/g)) {
    const ref = m[1];
    if (ref.includes('<') || ref.includes('$') || ref.startsWith('http') || WEBSITE_REPO.test(ref)) continue;
    const candidates = [
      path.join(ROOT, ref), path.join(path.dirname(f), ref),
      path.join(ROOT, 'skills', ref), ...skills.map(s => path.join(ROOT, 'skills', s, ref)),
      path.join(ROOT, 'scripts', ref), path.join(ROOT, 'hooks', 'scripts', ref), path.join(ROOT, 'skills', 'framer-site-ops', 'scripts', ref),
    ];
    if (!candidates.some(c => fs.existsSync(c))) { bad++; console.log(`${path.relative(ROOT, f)}: ${ref} not found`); }
  }
}
console.log(bad ? `${bad} dangling reference(s)` : 'No dangling references');
process.exit(bad ? 1 : 0);
