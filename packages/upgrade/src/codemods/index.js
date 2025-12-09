import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';
import { glob } from 'tinyglobby';
import { run } from 'jscodeshift/src/Runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CODEMOD_CONFIG = {
  'transform-remove-deprecated-props': {
    renderSummary: renderDeprecatedPropsSummary,
  },
};

const GLOBBY_IGNORE = [
  '**/*.md',
  'node_modules/**',
  '**/node_modules/**',
  '.git/**',
  '**/*.json',
  'package.json',
  '**/package.json',
  'package-lock.json',
  '**/package-lock.json',
  'yarn.lock',
  '**/yarn.lock',
  'pnpm-lock.yaml',
  '**/pnpm-lock.yaml',
  'yalc.lock',
  '**/*.{ico,png,webp,svg,gif,jpg,jpeg}',
  '**/*.{mp4,mkv,wmv,m4v,mov,avi,flv,webm,flac,mka,m4a,aac,ogg}',
  '**/*.{css,scss,sass,less,styl}',
];

export async function runCodemod(transform = 'transform-async-request', patterns, options = {}) {
  if (!transform) {
    throw new Error('No transform provided');
  }
  const resolvedPath = resolve(__dirname, `${transform}.cjs`);

  const paths = await glob(patterns, { ignore: GLOBBY_IGNORE });

  if (options.skipCodemods) {
    return {
      stats: {
        total: 0,
        modified: 0,
        deleted: 0,
      },
    };
  }

  // First pass: dry run to collect stats (jscodeshift only reports stats in dry mode)
  const dryResult = await run(resolvedPath, paths ?? [], {
    ...options,
    dry: true,
    silent: true,
  });

  let result = {};
  if (!options.dryRun) {
    // Second pass: apply the changes
    result = await run(resolvedPath, paths ?? [], {
      ...options,
      dry: false,
      silent: true,
    });
  }

  if (options.dry) {
    return dryResult;
  }

  // Merge stats from dry run into final result
  return {
    ...result,
    stats: dryResult.stats,
  };
}

export function getCodemodConfig(transform) {
  return CODEMOD_CONFIG[transform] || null;
}

function renderDeprecatedPropsSummary(stats) {
  if (!stats) {
    return;
  }

  const userButtonCount = stats.userbuttonAfterSignOutPropsRemoved || 0;
  const hideSlugCount = stats.hideSlugRemoved || 0;
  const beforeEmitCount = stats.beforeEmitTransformed || 0;

  if (!userButtonCount && !hideSlugCount && !beforeEmitCount) {
    return;
  }

  console.log(chalk.yellow.bold('Manual intervention may be required:'));

  if (userButtonCount > 0) {
    console.log(chalk.yellow(`• Removed ${userButtonCount} UserButton sign-out redirect prop(s)`));
    console.log(chalk.gray('  To configure sign-out redirects:'));
    console.log(chalk.gray('  - Global: Add afterSignOutUrl to <ClerkProvider>'));
    console.log(chalk.gray('  - Per-button: Use <SignOutButton redirectUrl="...">'));
    console.log(chalk.gray('  - Programmatic: clerk.signOut({ redirectUrl: "..." })'));
  }

  if (hideSlugCount > 0) {
    console.log(chalk.yellow(`• Removed ${hideSlugCount} hideSlug prop(s)`));
    console.log(chalk.gray('  Slugs are now managed in the Clerk Dashboard.'));
  }

  if (beforeEmitCount > 0) {
    console.log(chalk.yellow(`• Transformed ${beforeEmitCount} setActive({ beforeEmit }) → setActive({ navigate })`));
    console.log(chalk.gray('  The callback now receives an object with session property.'));
  }

  console.log('');
}
