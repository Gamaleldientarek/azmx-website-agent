#!/usr/bin/env node
// PreToolUse guard on Bash: publishing the live Framer site is a human's decision.
//
// framer.agent.publish has three actions. What each one does, and what this guard does with it:
//   { action: "preview" }               reads readiness, returns URLs and a hash; changes nothing   -> no opinion (passes through)
//   { action: "confirm_publish", ... }  publishes: on main that is the live site; on a branch only
//                                       a branch preview                                           -> blocked, except inside the sanctioned
//                                                                                                     branch-preview script, which checks the branch
//   { action: "deploy_to_production" }  deploys a version to the production domain                  -> blocked
// Also blocked: framer.deploy(...) (plain plugin API) and any `@framer/agent … publish` CLI form, should one appear.
//
// What the guard can see: the command text, scripts fed to the Framer agent from files (`< file`, `cat file |`, `-f`/`--file`),
// and local scripts the command runs directly (`bash x.sh`, `node x.mjs`, `./x.sh`), followed one level at a time up to four
// levels. It fails closed when an exec's code is not visible: an unreadable file, a pipe from anything but `cat <file>`,
// or command substitution inside the exec command. It is a guard against mistakes, not a sandbox: an installed package
// script (`npm run …`) or an encoded payload is outside its sight, which SECURITY.md says plainly.
// Everything passes when the site config says "allow-with-flag" and AZMX_SITE_ALLOW_PUBLISH=1 is set for that command.
import fs from 'node:fs';
import path from 'node:path';
import { readStdinJson, findSiteConfig, projectDir, pass, deny, PLUGIN_ROOT } from './lib.mjs';

const { input, raw } = readStdinJson();
// If the input could not be parsed, judge the raw text instead of passing blindly.
let command = input.tool_name ? (input.tool_name === 'Bash' ? String(input.tool_input?.command || '') : '') : raw;
if (!command) pass();
const original = command;
const cwd = projectDir(input);

try {
  // ---- 1. Pull in the scripts the command runs or feeds, so they are judged too. ----
  const MAX_BYTES = 256 * 1024;
  const seen = new Set();
  const unreadableExecFeeds = [];
  const resolveCandidates = (f) => {
    const expanded = f.replace(/^\$\{?CLAUDE_PLUGIN_ROOT\}?/, PLUGIN_ROOT).replace(/^~(?=\/)/, process.env.HOME || '~');
    return [expanded, path.resolve(cwd, expanded)];
  };
  const readFile = (f) => {
    for (const c of resolveCandidates(f)) {
      try { if (fs.existsSync(c) && fs.statSync(c).isFile()) return fs.readFileSync(c, 'utf8').slice(0, MAX_BYTES); } catch {}
    }
    return null;
  };
  const PATH = `["']?([^\\s"'|;&<>]+)["']?`;
  const EXEC_LINE = /@framer\/agent\S*\s+exec\b/;
  const findFiles = (text) => {
    const execFeeds = new Set(), runners = new Set();
    // Scripts fed to the Framer agent: only on lines that invoke `exec`, so `<id>` in a script's comments is not a redirect.
    for (const line of text.split('\n')) {
      if (!EXEC_LINE.test(line)) continue;
      for (const m of line.matchAll(new RegExp(`(?<![<>])<(?![<>&])(?!\\s*[^\\s"'|;&<>]+>)\\s*${PATH}`, 'g'))) execFeeds.add(m[1]);   // < file (not a heredoc, not an <angle> placeholder)
      for (const m of line.matchAll(new RegExp(`\\bcat\\s+${PATH}\\s*\\|`, 'g'))) execFeeds.add(m[1]);                   // cat file |
      for (const m of line.matchAll(new RegExp(`(?:^|\\s)(?:--file|-f)(?:=|\\s+)${PATH}`, 'g'))) execFeeds.add(m[1]);    // -f file, --file=file
    }
    // Local scripts the shell runs directly (one level at a time).
    for (const m of text.matchAll(new RegExp(`(?:^|[;&|(]\\s*|\\s&&\\s|\\s\\|\\|\\s)\\s*(?:bash|sh|zsh|source|\\.|node|bun|deno\\s+run|python3?|npx\\s+tsx)\\s+${PATH}`, 'gm'))) runners.add(m[1]);
    for (const m of text.matchAll(new RegExp(`(?:^|[;&|(]\\s*|\\s&&\\s|\\s\\|\\|\\s)\\s*(\\.?\\.?/[^\\s"'|;&<>]+)`, 'gm'))) runners.add(m[1]);
    return { execFeeds, runners };
  };
  let frontier = command;
  for (let round = 0; round < 4 && frontier; round++) {
    const { execFeeds, runners } = findFiles(frontier);
    let appended = '';
    for (const f of execFeeds) {
      if (seen.has(f)) continue; seen.add(f);
      const body = readFile(f);
      // Fail closed only for what the command itself feeds; a usage line inside a fetched script is informational.
      if (body === null) { if (round === 0) unreadableExecFeeds.push(f); } else appended += `\n/* ${f} */\n${body}`;
    }
    for (const f of runners) {
      if (seen.has(f)) continue; seen.add(f);
      const body = readFile(f);
      if (body !== null) appended += `\n/* ${f} */\n${body}`;
    }
    command += appended;
    frontier = appended;
  }

  // ---- 2. Does any of it touch the Framer agent or a publish call? ----
  const touchesFramer = /@framer\/agent|\bframer\s*[.?\[]|confirm_publish|deploy_to_production|publishForAgent/.test(command);
  if (!touchesFramer) pass();

  // ---- 3. Fail closed when an exec's code is out of sight. ----
  const execCmd = /@framer\/agent\S*\s+exec\b/;
  if (execCmd.test(original)) {
    if (unreadableExecFeeds.length) {
      deny(`Blocked by the azmx-site plugin: the Framer agent would run a script the guard cannot read (${unreadableExecFeeds.join(', ')}). Run it from the website repository root with a path the guard can resolve, or paste the script in a quoted heredoc.`);
    }
    // A pipe into exec from anything but `cat <readable file>`.
    for (const seg of original.split(/\n/)) {
      const m = seg.match(/^(.*?)\|\s*(?:[^|]*?@framer\/agent\S*\s+exec\b)/);
      if (m && !/^\s*cat\s+["']?[^\s"'|;&<>]+["']?\s*$/.test(m[1])) {
        deny('Blocked by the azmx-site plugin: a Framer agent exec fed through a pipe the guard cannot inspect. Feed scripts with `< file` or a quoted heredoc.');
      }
    }
    const execSegments = original.split(/\n|&&|\|\||;/).filter(s => execCmd.test(s));
    if (execSegments.some(s => /\$\(|`/.test(s))) {
      deny('Blocked by the azmx-site plugin: command substitution inside a Framer agent exec hides the code from the guard. Write the script out or feed it from a file.');
    }
  }

  // ---- 4. Is it a publish? ----
  const confirms = /confirm_publish|confirm_\\?["'`]\s*\+|publishForAgent/.test(command);
  const deploys = /deploy_to_production|deploy_to_\\?["'`]\s*\+|(?:[.?]\s*|\[\s*\\?["'`])deploy\b/.test(command);
  const cliPublish = /@framer\/agent(@[^ ]+)?\s+publish\b/.test(command);
  const publishCall = /(?:[.?]\s*|\[\s*\\?["'`])publish\b/.test(command);
  if (!confirms && !deploys && !cliPublish && !publishCall) pass();

  // A bare preview changes nothing.
  const previewOnly = publishCall && !confirms && !deploys && !cliPublish && /action\s*[:=]\s*\\?["']preview\\?["']/.test(command);
  if (previewOnly) pass();

  // The sanctioned branch-preview script: it reads the active branch and throws before any confirm on main.
  const sanctionedBranchPreview = confirms && !deploys && !cliPublish
    && /AZMX_SITE_BRANCH_PREVIEW/.test(command)
    && /getActiveBranch\s*\(/.test(command)
    && /throw\s+new\s+Error/.test(command);
  if (sanctionedBranchPreview) pass();

  const site = findSiteConfig(cwd);
  const policy = site?.config?.framer?.publish || 'human-only';
  const flag = process.env.AZMX_SITE_ALLOW_PUBLISH === '1' || /\bAZMX_SITE_ALLOW_PUBLISH=1\b/.test(original);
  if (policy === 'allow-with-flag' && flag) pass();

  const what = deploys ? 'deploy_to_production or framer.deploy' : cliPublish ? 'the CLI publish command' : confirms ? 'confirm_publish' : 'a publish call without action "preview"';
  deny(
    `Blocked by the azmx-site plugin: this command contains ${what}, which publishes the site. Publishing is the owner's decision. ` +
    'Allowed instead: { action: "preview" } on its own (readiness and URLs, nothing published), or a branch preview through the plugin script ' +
    'skills/framer-site-ops/scripts/branch-preview.js, which refuses to run on main. Prepare the change, merge it to main, and ask the owner to publish from Framer.' +
    (policy === 'allow-with-flag' ? ' (This site allows a production publish when the owner sets AZMX_SITE_ALLOW_PUBLISH=1 for the command.)' : '') +
    (site?.error ? ` (site-agent.json could not be read: ${site.error}; the strictest policy applies.)` : '')
  );
} catch (e) {
  if (/@framer\/agent|framer\s*[.?\[]|confirm_publish|deploy_to_production/.test(command)) {
    deny(`Blocked by the azmx-site plugin: the publish guard hit an error (${e.message}) on a command that touches the Framer agent, so it blocks to be safe.`);
  }
  pass();
}
