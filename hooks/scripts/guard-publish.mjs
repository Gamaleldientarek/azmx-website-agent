#!/usr/bin/env node
// PreToolUse guard on Bash: publishing the live Framer site is a human's decision.
//
// framer.agent.publish has four actions. What each one does, and what this guard does with it:
//   { action: "preview" }               reads readiness, returns URLs and a hash; changes nothing    -> allowed
//   { action: "confirm_publish", ... }  publishes: on main that is the live site; on a branch only
//                                       a branch preview                                            -> allowed only inside the
//                                                                                                      sanctioned branch-preview script,
//                                                                                                      which checks the branch itself
//   { action: "deploy_to_production" }  deploys a version to the production domain                   -> blocked
//   the CLI's own `publish` command                                                                  -> blocked
// Everything is allowed when the site config says "allow-with-flag" and AZMX_SITE_ALLOW_PUBLISH=1 is set
// for that command. Reads are never touched.
import fs from 'node:fs';
import path from 'node:path';
import { readStdinJson, findSiteConfig, projectDir, allow, deny } from './lib.mjs';

const { input, raw } = readStdinJson();
// Defence in depth: if the input could not be parsed, judge the raw text instead of allowing blindly.
let command = input.tool_name ? (input.tool_name === 'Bash' ? String(input.tool_input?.command || '') : '') : raw;
if (!command) allow();

// A script fed to exec from a file (`exec -s 1 < file.js`, `cat file.js | … exec`, `--file file.js`) is judged by its contents too.
if (/@framer\/agent/.test(command)) {
  const cwd = projectDir(input);
  const files = new Set();
  for (const m of command.matchAll(/<\s*["']?([^\s"'|;&<>]+\.(?:m?js|cjs|ts))["']?/g)) files.add(m[1]);
  for (const m of command.matchAll(/\bcat\s+["']?([^\s"'|;&<>]+\.(?:m?js|cjs|ts))["']?\s*\|/g)) files.add(m[1]);
  for (const m of command.matchAll(/--file[= ]\s*["']?([^\s"'|;&<>]+)["']?/g)) files.add(m[1]);
  for (const f of files) {
    const candidates = [f, path.resolve(cwd, f), path.resolve(cwd, f.replace(/^\$\{?CLAUDE_PLUGIN_ROOT\}?\/?/, (process.env.CLAUDE_PLUGIN_ROOT || '') + '/'))];
    for (const c of candidates) {
      try { if (fs.existsSync(c) && fs.statSync(c).isFile()) { command += '\n' + fs.readFileSync(c, 'utf8'); break; } } catch {}
    }
  }
}

const touchesFramer = /@framer\/agent|framer\.agent\.|framer\.publish|confirm_publish|deploy_to_production/.test(command);
if (!touchesFramer) allow();

const confirms = /\bconfirm_publish\b/.test(command);
const deploys = /\bdeploy_to_production\b/.test(command);
const cliPublish = /@framer\/agent(@[^ ]+)?\s+publish\b/.test(command);
const publishCall = /framer\.agent\.publish\s*\(|framer\.publish\s*\(/.test(command);
if (!confirms && !deploys && !cliPublish && !publishCall) allow();

// A bare preview changes nothing.
const previewOnly = publishCall && !confirms && !deploys && !cliPublish && /action\s*[:=]\s*\\?["']preview\\?["']/.test(command);
if (previewOnly) allow();

// The sanctioned branch-preview script: it reads the active branch and throws before any confirm on main.
const sanctionedBranchPreview = confirms && !deploys && !cliPublish
  && /AZMX_SITE_BRANCH_PREVIEW/.test(command)
  && /getActiveBranch\s*\(/.test(command)
  && /throw\s+new\s+Error/.test(command);
if (sanctionedBranchPreview) allow();

const site = findSiteConfig(projectDir(input));
const policy = site?.config?.framer?.publish || 'human-only';
const flag = process.env.AZMX_SITE_ALLOW_PUBLISH === '1' || /\bAZMX_SITE_ALLOW_PUBLISH=1\b/.test(command);
if (policy === 'allow-with-flag' && flag) allow();

const what = deploys ? 'deploy_to_production' : cliPublish ? 'the CLI publish command' : confirms ? 'confirm_publish' : 'framer.agent.publish without action "preview"';
deny(
  `Blocked by the azmx-site plugin: this command contains ${what}, which publishes the site. Publishing is the owner's decision. ` +
  'Allowed instead: { action: "preview" } on its own (readiness and URLs, nothing published), or a branch preview through the plugin script ' +
  'skills/framer-site-ops/scripts/branch-preview.js, which refuses to run on main. Prepare the change, merge it to main, and ask the owner to publish from Framer.' +
  (policy === 'allow-with-flag' ? ' (This site allows a production publish when the owner sets AZMX_SITE_ALLOW_PUBLISH=1 for the command.)' : '')
);
