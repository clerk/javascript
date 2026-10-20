#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  CLERK_SDK_PLUGIN_END,
  CLERK_SDK_PLUGIN_START,
  clerkAgentRulesSdks,
  renderClerkSdkPluginBlock,
} from '../packages/shared/src/agentRules/index.ts';

const check = process.argv.includes('--check');
const problems = [];

for (const sdk of clerkAgentRulesSdks) {
  const file = fileURLToPath(new URL(`../packages/${sdk}/AGENTS.md`, import.meta.url));
  const relative = `packages/${sdk}/AGENTS.md`;
  const content = await readFile(file, 'utf8').catch(() => null);

  if (content === null) {
    problems.push(`${relative} is missing`);
    continue;
  }

  const start = content.indexOf(CLERK_SDK_PLUGIN_START);
  const end = content.indexOf(CLERK_SDK_PLUGIN_END, start);

  if (start === -1 || end === -1) {
    problems.push(`${relative} has no ${CLERK_SDK_PLUGIN_START} ... ${CLERK_SDK_PLUGIN_END} markers`);
    continue;
  }

  const next = content.slice(0, start) + renderClerkSdkPluginBlock() + content.slice(end + CLERK_SDK_PLUGIN_END.length);

  if (next === content) {
    continue;
  }

  if (check) {
    problems.push(`${relative} is out of date`);
  } else {
    await writeFile(file, next);
    console.log(`Updated ${relative}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  if (check) {
    console.error('Run `pnpm agents-md:sync` to update the Clerk plugin section in each SDK AGENTS.md.');
  }
  process.exit(1);
}
