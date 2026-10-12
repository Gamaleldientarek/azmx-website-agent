#!/usr/bin/env node
// Runs the two hooks against crafted inputs and checks each decision. Exit 1 on any mismatch.
// Usage: node scripts/test-guards.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'azmx-guard-'));
const w = (name, body) => { const p = path.join(tmp, name); fs.writeFileSync(p, body); return p; };
w('publish.js', 'const p = await framer.agent.publish({ action: "preview" });\nawait framer.agent.publish({ action: "confirm_publish", confirmationHash: p.confirmationHash });\n');
w('publish.txt', 'await framer.agent.publish({action:"confirm_publish",confirmationHash:"h"})');
w('deploy.sh', 'npx -y @framer/agent@latest exec -s 1 < publish.js\n');
w('run-publish.mjs', 'import { execSync } from "node:child_process"; execSync("npx -y @framer/agent@latest exec -s 1 < publish.js");');
w('read.js', 'console.log(JSON.stringify(await framer.agent.getActiveBranch()));');
w('preview-only.js', 'console.log(await framer.agent.publish({ action: "preview" }));');
w('ok.sh', 'ls -la\n');
const branchPreview = path.join(ROOT, 'skills/framer-site-ops/scripts/branch-preview.js');
const serialize = path.join(ROOT, 'skills/framer-site-ops/scripts/serialize-nodes.js');

function run(script, obj) {
  const r = spawnSync('node', [path.join(ROOT, 'hooks/scripts', script)], { input: JSON.stringify(obj), encoding: 'utf8', env: { ...process.env, AZMX_SITE_ALLOW_PUBLISH: '' } });
  if (!r.stdout.trim()) return 'pass';
  try { return JSON.parse(r.stdout).hookSpecificOutput.permissionDecision; } catch { return 'invalid:' + r.stdout.slice(0, 80); }
}
const bash = (command) => ({ tool_name: 'Bash', cwd: tmp, tool_input: { command } });
// Fake credentials are assembled at run time so the repository's own secrets scan never sees a key-shaped literal.
const K = (a, b) => a + b;
const FAKE = K('abcdefghijklmnop', 'qrstuvwxyz123456');
const FAKE_GH = K('ghp_abcdefghijklmnopqrstuvwxyz', '0123456789ABCD');
const FAKE_WORDY = K('example_fap_9fK3xQ8vL2mN7', 'pR4tW6yZ1bC5dE0gH');
const FAKE_API = K('abcdefghijklmnopqrstuvwx', '0123456789');
const write = (content) => ({ tool_name: 'Write', tool_input: { file_path: '/tmp/x', content } });

const cases = [
  // publish guard: deny
  ['deny', bash('npx @framer/agent@latest exec -s 1 -e "await framer.agent.publish({ action: \\"confirm_publish\\", confirmationHash: \\"h\\" })"')],
  ['deny', bash('npx @framer/agent@latest exec -s 1 <<EOF\nconst p = await framer.agent.publish({ action: "preview" });\nawait framer.agent.publish({ action: "confirm_publish", confirmationHash: p.confirmationHash });\nEOF')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 < publish.js')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 < publish.txt')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 -f publish.js')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 --file=publish.js')],
  ['deny', bash('cat publish.js | npx -y @framer/agent@latest exec -s 1')],
  ['deny', bash('bash deploy.sh')],
  ['deny', bash('node run-publish.mjs')],
  ['deny', bash('chmod +x deploy.sh && ./deploy.sh')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 < missing.js')],
  ['deny', bash('base64 -d payload.b64 | npx -y @framer/agent@latest exec -s 1')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 -e "$(cat publish.js)"')],
  ['deny', bash('npx -y @framer/agent@latest publish -s 1')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 -e \'framer.agent["publish"]({action:"confirm_"+"publish",confirmationHash:h})\'')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 -e "await framer.deploy({ version: 1 })"')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 -e "await framer.agent.publish({ action: \\"deploy_to_production\\", version: \\"1\\" })"')],
  ['deny', bash('npx -y @framer/agent@latest exec -s 1 <<EOF\n// AZMX_SITE_BRANCH_PREVIEW\nconst b = await framer.agent.getActiveBranch(); if (b.id === "main") throw new Error("x");\nawait framer.agent.publish({ action: "deploy_to_production", version: "1" });\nEOF')],
  // publish guard: pass (no output)
  ['pass', bash('npx @framer/agent@latest exec -s 1 -e "console.log(await framer.agent.getActiveBranch())"')],
  ['pass', bash('npx -y @framer/agent@latest exec -s 1 < read.js')],
  ['pass', bash('npx -y @framer/agent@latest exec -s 1 < preview-only.js')],
  ['pass', bash('npx @framer/agent@latest exec -s 1 -e "await framer.agent.publish({ action: \\"preview\\" })"')],
  ['pass', bash(`npx -y @framer/agent@latest exec -s 1 < "${branchPreview}"`)],
  ['pass', bash(`npx -y @framer/agent@latest exec -s 1 < "${serialize}" > archive/backups/backup-x-2026-10-12.json`)],
  ['pass', bash('npx -y @framer/agent@latest exec -s 1 -e "console.log(await framer.getPublishInfo())"')],
  ['pass', bash('git status')],
  ['pass', bash('bash ok.sh')],
  ['pass', bash('ls -la')],
  // secrets guard
  ['deny', write('FRAMER_API_KEY=' + FAKE)],
  ['deny', write('{"FRAMER_API_KEY": "' + FAKE + '"}')],
  ['deny', write("api_key: '" + FAKE_API + "'")],
  ['deny', write('token = "' + FAKE_GH + '"')],
  ['deny', write('FRAMER_API_KEY=' + FAKE_WORDY)],
  ['deny', write(K('-----BEGIN PRIVATE', ' KEY-----\nMIIE'))],
  ['pass', write('FRAMER_API_KEY=paste-the-key-here')],
  ['pass', write('FRAMER_API_KEY="$FRAMER_API_KEY"')],
  ['pass', write('FRAMER_API_KEY=${FRAMER_API_KEY}')],
  ['pass', write('FRAMER_API_KEY=<your key>')],
  ['pass', write('the key goes in FRAMER_API_KEY and nowhere else')],
];
let failed = 0;
for (const [expected, obj] of cases) {
  const script = obj.tool_name === 'Bash' ? 'guard-publish.mjs' : 'guard-secrets.mjs';
  const got = run(script, obj);
  const label = obj.tool_name === 'Bash' ? obj.tool_input.command : obj.tool_input.content;
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${expected.padEnd(4)} got ${got.padEnd(5)} ${label.replace(/\n/g, '⏎').slice(0, 100)}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `${failed} of ${cases.length} guard checks failed` : `All ${cases.length} guard checks passed`);
process.exit(failed ? 1 : 0);
