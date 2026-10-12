#!/usr/bin/env node
// PreToolUse guard on Write/Edit: refuse to write anything that looks like a credential into a file.
// Keys live in the environment (FRAMER_API_KEY) or the owner's secrets folder, never in a repository.
import { readStdinJson, findSecret, allow, deny } from './lib.mjs';

const { input } = readStdinJson();
const t = input.tool_input || {};
const candidates = [t.content, t.new_string, t.new_source];
if (Array.isArray(t.edits)) for (const e of t.edits) candidates.push(e.new_string);

for (const text of candidates) {
  const hit = findSecret(typeof text === 'string' ? text : '');
  if (hit) {
    deny(`Blocked by the azmx-site plugin: the text being written contains what looks like a ${hit.name} (${hit.sample}). Keys never go into files in this repository. Keep it in the environment (FRAMER_API_KEY) or the owner's secrets folder, and reference it by name.`);
  }
}
allow();
