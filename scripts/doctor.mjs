#!/usr/bin/env node
// Checks the environment for working on the site. Never prints a key.
// Usage: node "$CLAUDE_PLUGIN_ROOT/scripts/doctor.mjs" [--online]   from the website repository (it finds site-agent.json by walking up
//        from the working directory, or from CLAUDE_PROJECT_DIR). --online also signs in when a key is present, opens a session and reads the branch.
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findSiteConfig } from '../hooks/scripts/lib.mjs';

const online = process.argv.includes('--online');
const rows = [];
const ok = (name, detail) => rows.push(['ok', name, detail]);
const warn = (name, detail) => rows.push(['warn', name, detail]);
const fail = (name, detail) => rows.push(['FAIL', name, detail]);

const nodeMajor = Number(process.versions.node.split('.')[0]);
(nodeMajor >= 18 ? ok : fail)('node', `v${process.versions.node}${nodeMajor < 18 ? ' (18 or newer needed by the Framer agent)' : ''}`);
try { execSync('npx --version', { stdio: 'pipe' }); ok('npx', 'available'); } catch { fail('npx', 'not found; install Node.js 18+'); }

const site = findSiteConfig(process.env.CLAUDE_PROJECT_DIR || process.cwd());
if (!site) {
  fail('site-agent.json', 'not found above the working directory; copy site-agent.example.json into the website repository root');
} else {
  ok('site-agent.json', site.path);
  const c = site.config;
  const pid = c.framer?.projectId || '';
  (/^[A-Za-z0-9_-]{6,40}$/.test(pid) && !/REPLACE/.test(pid) ? ok : fail)('framer.projectId', pid ? (pid.slice(0, 4) + '…') : 'missing');
  ok('publish policy', c.framer?.publish || 'human-only (default)');
  for (const [key, label] of [['handbook', 'handbook'], ['siteMap', 'site map'], ['tasks', 'task list'], ['review', 'review log'], ['rules', 'rules file'], ['backups', 'backups folder']]) {
    const rel = c.docs?.[key];
    if (!rel) { warn(label, 'not configured'); continue; }
    (fs.existsSync(path.join(site.root, rel)) ? ok : fail)(label, rel);
  }
}
(process.env.FRAMER_API_KEY ? ok : warn)('FRAMER_API_KEY', process.env.FRAMER_API_KEY ? 'set (value hidden)' : 'not set; fine on a Mac with browser sign-in, required in a cloud environment');
const skill = path.join(process.env.HOME || '', '.claude', 'skills', 'framer', 'SKILL.md');
(fs.existsSync(skill) ? ok : warn)('framer skill', fs.existsSync(skill) ? skill : 'not installed yet; scripts/framer-auth.sh runs `npx @framer/agent@latest setup`');
try {
  const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const top = execSync('git rev-parse --show-toplevel', { cwd: pluginRoot, stdio: 'pipe', encoding: 'utf8' }).trim();
  if (top === pluginRoot) {
    let hp = ''; try { hp = execSync('git config --get core.hooksPath', { cwd: pluginRoot, stdio: 'pipe', encoding: 'utf8' }).trim(); } catch {}
    (hp === '.githooks' ? ok : warn)('plugin pre-commit', hp === '.githooks' ? 'secrets scan enabled' : 'not enabled in this clone: git config core.hooksPath .githooks');
  }
} catch {}
const allow = process.env.AZMX_SITE_ALLOW_PUBLISH === '1';
(allow ? warn : ok)('publish guard', allow ? 'AZMX_SITE_ALLOW_PUBLISH=1 is set in this shell: a production publish would pass the hook' : 'armed: production publish blocked, previews allowed');

if (online && site) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  if (process.env.FRAMER_API_KEY) {
    const a = spawnSync('bash', [path.join(here, 'framer-auth.sh')], { encoding: 'utf8' });
    (a.status === 0 ? ok : warn)('framer sign-in', (a.stdout || a.stderr || '').trim().split('\n')[0] || 'ran');
  }
  const s = spawnSync('bash', [path.join(here, 'framer-session.sh')], { encoding: 'utf8' });
  if (s.status !== 0) fail('framer session', (s.stderr || s.stdout || '').trim().split('\n').pop());
  else {
    const sid = s.stdout.trim();
    ok('framer session', `#${sid}`);
    const b = spawnSync('npx', ['-y', '@framer/agent@latest', 'exec', '-s', sid, '-e', 'console.log(JSON.stringify(await framer.agent.getActiveBranch()))'], { encoding: 'utf8' });
    const line = (b.stdout || '').trim().split('\n').filter(l => l.startsWith('{')).pop();
    (line ? ok : warn)('active branch', line || (b.stderr || '').trim().split('\n').pop() || 'could not read');
  }
}
const width = Math.max(...rows.map(r => r[1].length));
for (const [status, name, detail] of rows) console.log(`${status.padEnd(4)} ${name.padEnd(width)}  ${detail}`);
process.exit(rows.some(r => r[0] === 'FAIL') ? 1 : 0);
