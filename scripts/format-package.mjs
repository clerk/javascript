#!/usr/bin/env node

import { $ } from 'zx';

async function formatPackage() {
  const isCheck = process.argv.includes('--check');
  const baseArgs = isCheck
    ? ['prettier', '--cache', '--check', '--ignore-path', '../../.prettierignore']
    : ['prettier', '--write', '--ignore-path', '../../.prettierignore'];

  try {
    await $`pnpm ${baseArgs} .`;
    console.log(`✅ Package files ${isCheck ? 'check passed' : 'formatted successfully'}`);
  } catch (error) {
    console.error(`❌ Package files ${isCheck ? 'check failed' : 'formatting failed'}`);
    if (error.stderr) {
      console.error(error.stderr);
    }
    process.exit(1);
  }
}

formatPackage().catch(console.error);
