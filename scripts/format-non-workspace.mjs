#!/usr/bin/env node

import { $ } from 'zx';

/**
 * Format files that are not part of workspace packages.
 * This includes:
 * - integration/ directory
 * - playground/ directory
 * - scripts/ directory
 * - .github/ directory
 * - Root level config files
 */

const NON_WORKSPACE_PATHS = [
  'integration',
  'playground',
  'scripts',
  '.github',
  // Root level config files
  '*.json',
  '*.md',
  '*.mjs',
  '*.ts',
  '*.yaml',
  '.prettierrc*',
];

async function formatNonWorkspaceFiles() {
  const isCheck = process.argv.includes('--check');
  const baseArgs = isCheck
    ? ['prettier', '--cache', '--check', '--ignore-unknown']
    : ['prettier', '--write', '--ignore-unknown'];

  console.log(`${isCheck ? 'Checking' : 'Formatting'} non-workspace files...`);

  try {
    await $`pnpm ${baseArgs} ${NON_WORKSPACE_PATHS}`;
    console.log(`✅ Non-workspace files ${isCheck ? 'check passed' : 'formatted successfully'}`);
  } catch (error) {
    console.error(`❌ Non-workspace files ${isCheck ? 'check failed' : 'formatting failed'}`);
    process.exit(1);
  }
}

formatNonWorkspaceFiles().catch(console.error);
