#!/usr/bin/env node
// Guard against `pull_request_target` re-entering the workflow tree.
//
// `pull_request_target` runs with a read-write GITHUB_TOKEN and access to repo
// secrets while in the context of a fork-affected PR. Chained with a checkout or
// cache restore it is the "Pwn Request" primitive behind the TanStack supply-chain
// compromise. SDK-80 removed the repo's only instance (the labeler) in favour of a
// `pull_request` + `workflow_run` handshake; this check keeps it gone.
//
// Part of SDK-79 / Monorepo Supply-Chain Hardening. Run by workflow-governance.yml.

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WORKFLOW_DIR = fileURLToPath(new URL('../.github/workflows', import.meta.url));
const BANNED = 'pull_request_target';

// Strip a YAML comment from a line. Trigger declarations never carry a quoted '#',
// so a plain split is sufficient here and keeps the check dependency-free.
const stripComment = line => {
  const i = line.indexOf('#');
  return i === -1 ? line : line.slice(0, i);
};

// Return only the text of a workflow's top-level `on:` block, so we never match
// `pull_request_target` where it appears in a comment, an `if:` expression, or a
// `run:` script. Handles every trigger form: mapping, list, inline array, and an
// inline/scalar value.
const extractOnBlock = src => {
  const lines = src.split('\n').map(stripComment);
  const blocks = [];

  for (let i = 0; i < lines.length; i++) {
    const header = lines[i].match(/^(\s*)['"]?on['"]?\s*:(.*)$/);
    if (!header) continue;

    const indent = header[1].length;
    const inline = header[2].trim();
    if (inline) {
      blocks.push(inline);
      continue;
    }

    const buf = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === '') {
        buf.push(lines[j]);
        continue;
      }
      const childIndent = lines[j].match(/^(\s*)/)[1].length;
      if (childIndent <= indent) break;
      buf.push(lines[j]);
    }
    blocks.push(buf.join('\n'));
  }

  return blocks.join('\n');
};

const files = readdirSync(WORKFLOW_DIR).filter(f => /\.ya?ml$/.test(f));
const wordRe = new RegExp(`\\b${BANNED}\\b`);
const offenders = files.filter(f => wordRe.test(extractOnBlock(readFileSync(`${WORKFLOW_DIR}/${f}`, 'utf8'))));

if (offenders.length > 0) {
  console.error(`✖ Banned workflow trigger '${BANNED}' found in:`);
  for (const f of offenders) console.error(`    .github/workflows/${f}`);
  console.error(
    `\n'${BANNED}' grants a read-write token and repo secrets to a fork-affected PR\n` +
      `context. It was removed in SDK-80 and must not return. If you need privileged\n` +
      `automation on fork PRs, use the 'pull_request' + 'workflow_run' handshake\n` +
      `(see .github/workflows/labeler.yml and labeler-apply.yml).`,
  );
  process.exit(1);
}

console.log(`✓ No '${BANNED}' triggers across ${files.length} workflow files.`);
