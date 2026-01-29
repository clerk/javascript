#!/usr/bin/env node

import { glob } from 'tinyglobby';
import { $ } from 'zx';

const ROOT_FILE_PATTERNS = ['*.cjs', '*.js', '*.json', '*.md', '*.mjs', '*.ts', '*.yaml'];
const NON_WORKSPACE_PATTERNS = [
  'docs/**/*.{js,jsx,ts,tsx,json,md,mdx}',
  'integration/**/*.{js,jsx,ts,tsx,json,md,mdx}',
  'playground/**/*.{js,jsx,ts,tsx,json,md,mdx}',
  'scripts/**/*.{js,jsx,ts,tsx,json,md,mdx}',
];

async function getExistingFiles() {
  const existingFiles = [];

  for (const pattern of ROOT_FILE_PATTERNS) {
    try {
      const matches = await glob(pattern, {
        ignore: ['node_modules/**', '**/node_modules/**', 'packages/**'],
      });
      existingFiles.push(...matches);
    } catch {
      // Pattern didn't match any files, skip it
    }
  }

  for (const pattern of NON_WORKSPACE_PATTERNS) {
    try {
      const matches = await glob(pattern, {
        ignore: [
          'node_modules/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/coverage/**',
          '**/.turbo/**',
          '**/.next/**',
          '**/.tsup/**',
          '**/.cache/**',
        ],
      });
      existingFiles.push(...matches);
    } catch {
      // Pattern didn't match any files, skip it
    }
  }

  return existingFiles.filter(Boolean);
}

async function formatNonWorkspaceFiles() {
  const isCheck = process.argv.includes('--check');
  const isVerbose = process.argv.includes('--verbose');
  const baseArgs = isCheck
    ? ['prettier', '--cache', '--check', '--ignore-unknown', '--ignore-path', '.prettierignore']
    : ['prettier', '--write', '--ignore-unknown', '--ignore-path', '.prettierignore'];

  console.log(`${isCheck ? 'Checking' : 'Formatting'} non-workspace files...`);

  try {
    const existingFiles = await getExistingFiles();

    if (existingFiles.length === 0) {
      console.log('ℹ️  No non-workspace files found to format');
      return;
    }

    console.log(`📁 Found ${existingFiles.length} files/directories to format`);

    if (isVerbose) {
      console.log('\n📄 Files to be formatted:');
      existingFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
      });
      console.log('');
    }

    await $`pnpm ${baseArgs} ${existingFiles}`;
    console.log(`✅ Non-workspace files ${isCheck ? 'check passed' : 'formatted successfully'}`);
  } catch (error) {
    console.error(`❌ Non-workspace files ${isCheck ? 'check failed' : 'formatting failed'}`);
    if (error.stderr) {
      console.error(error.stderr);
    }
    process.exit(1);
  }
}

formatNonWorkspaceFiles().catch(console.error);
