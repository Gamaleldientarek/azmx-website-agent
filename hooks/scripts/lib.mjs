// Shared helpers for the azmx-site hooks and scripts. No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The plugin's root folder, from this file's own location (works wherever the plugin is installed). */
export const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Reads the hook input. Returns { input, raw }: input is {} when the JSON could not be parsed, raw is the text. */
export function readStdinJson() {
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch { raw = ''; }
  try {
    return { input: raw.trim() ? JSON.parse(raw) : {}, raw };
  } catch {
    return { input: {}, raw };
  }
}

export function projectDir(input = {}) {
  return process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
}

/**
 * Find site-agent.json walking up from the project directory.
 * Returns { path, root, config, error } or null when no file exists. A file that cannot be parsed, or a broken
 * site-agent.local.json next to it, yields config: null and an error, so callers fall back to the strictest policy.
 */
export function findSiteConfig(startDir) {
  let dir = path.resolve(startDir || process.cwd());
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'site-agent.json');
    if (fs.existsSync(candidate)) {
      try {
        const config = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        const localPath = path.join(dir, 'site-agent.local.json');
        if (fs.existsSync(localPath)) {
          try {
            deepMerge(config, JSON.parse(fs.readFileSync(localPath, 'utf8')));
          } catch (e) {
            return { path: candidate, root: dir, config: null, error: `site-agent.local.json: ${e.message}` };
          }
        }
        return { path: candidate, root: dir, config, error: null };
      } catch (e) {
        return { path: candidate, root: dir, config: null, error: `site-agent.json: ${e.message}` };
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object') {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

/** Patterns that look like credentials. A quote may sit between the name and the separator (JSON, YAML). */
export const SECRET_PATTERNS = [
  { name: 'Framer API key assignment', re: /FRAMER_API_KEY["']?\s*[:=]\s*["']?([A-Za-z0-9_\-]{16,})/g },
  { name: 'generic API key or token', re: /\b(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret)\b["']?\s*[:=]\s*["']?([A-Za-z0-9_\-]{24,})/gi },
  { name: 'OpenAI-style key', re: /\bsk-[A-Za-z0-9_\-]{20,}\b/g },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_\-]{35}\b/g },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9\-]{10,}\b/g },
  { name: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g },
];

/**
 * A value is a placeholder only when it reads as words or a reference, not as a key: it names a placeholder
 * (`paste`, `replace`, `your-key`, `example`, `xxx`), is a variable reference (`${VAR}`, `$VAR`), an angle-bracket
 * slot, or a run of masking characters. A value that looks random (letters and digits mixed, 20 characters or more)
 * is treated as a key even when a placeholder word appears inside it.
 */
function isPlaceholder(value) {
  const looksRandom = value.length >= 20 && /[A-Za-z]/.test(value) && /\d/.test(value) && !/^(?:xx+|XX+)/.test(value);
  if (looksRandom) return false;
  return /^(?:paste|replace|your[_-]?|example|sample|dummy|changeme|xxx|\$\{?[A-Za-z_][A-Za-z0-9_]*\}?$|<[^>]+>$|[*•x]{4,}$)/i.test(value)
    || /(?:paste|replace|your[_-]?key|example|changeme|\$\{|\$[A-Z_]|<[^>]+>|\*{4,}|•{4,})/i.test(value);
}

/** Returns the first finding {name, sample} or null. */
export function findSecret(text) {
  if (!text) return null;
  for (const { name, re } of SECRET_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const value = m[m.length - 1] || m[0];
      if (isPlaceholder(value)) continue;
      return { name, sample: value.slice(0, 4) + '…' + value.slice(-2) };
    }
  }
  return null;
}

/** No opinion: exit 0 with no output so the call continues through Claude Code's normal permission flow. Never emits "allow". */
export function pass() {
  process.exit(0);
}

export function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
    systemMessage: reason,
  }));
  process.exit(0);
}
