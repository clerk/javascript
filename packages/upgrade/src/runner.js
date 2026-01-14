import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import indexToPosition from 'index-to-position';
import { glob } from 'tinyglobby';

import { getCodemodConfig, runCodemod } from './codemods/index.js';
import { createSpinner, renderCodemodResults } from './render.js';

const GLOBBY_IGNORE = [
  'node_modules/**',
  '**/node_modules/**',
  '.git/**',
  'dist/**',
  '**/dist/**',
  'build/**',
  '**/build/**',
  '.next/**',
  '**/.next/**',
  'package.json',
  '**/package.json',
  'package-lock.json',
  '**/package-lock.json',
  'yarn.lock',
  '**/yarn.lock',
  'pnpm-lock.yaml',
  '**/pnpm-lock.yaml',
  '**/*.{png,webp,svg,gif,jpg,jpeg}',
  '**/*.{mp4,mkv,wmv,m4v,mov,avi,flv,webm,flac,mka,m4a,aac,ogg}',
];

export async function runCodemods(config, sdk, options) {
  const codemods = config.codemods || [];

  if (codemods.length === 0) {
    return;
  }

  const patterns = typeof options.glob === 'string' ? options.glob.split(/[ ,]/).filter(Boolean) : options.glob;

  for (const codemod of codemods) {
    // Support both string format and object format with packages filter
    const transform = typeof codemod === 'string' ? codemod : codemod.name;
    const packages = typeof codemod === 'string' ? ['*'] : codemod.packages || ['*'];

    // Skip codemod if it doesn't apply to the current SDK
    if (!packages.includes('*') && !packages.includes(sdk)) {
      continue;
    }

    const spinner = createSpinner(`Running codemod: ${transform}`);

    try {
      const result = await runCodemod(transform, patterns, options);
      spinner.success(`Codemod applied: ${chalk.dim(transform)}`);
      renderCodemodResults(transform, result);

      const codemodConfig = getCodemodConfig(transform);
      if (codemodConfig?.renderSummary && result.stats) {
        codemodConfig.renderSummary(result.stats);
      }
    } catch (error) {
      spinner.error(`Codemod failed: ${transform}`);
      throw error;
    }
  }
}

export async function runScans(config, sdk, options) {
  const matchers = loadMatchers(config, sdk);

  if (matchers.length === 0) {
    return [];
  }

  const spinner = createSpinner('Scanning files for breaking changes...');

  try {
    const cwd = path.resolve(options.dir);
    const files = await glob('**/*', {
      cwd,
      absolute: true,
      ignore: [...GLOBBY_IGNORE, ...(options.ignore || [])],
    });

    const results = {};

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      spinner.update(`Scanning ${path.basename(file)} (${idx + 1}/${files.length})`);

      const content = await fs.readFile(file, 'utf8');

      for (const matcher of matchers) {
        const matches = findMatches(content, matcher.matcher);

        if (matches.length === 0) {
          continue;
        }

        if (!results[matcher.title]) {
          results[matcher.title] = { instances: [], ...matcher };
        }

        for (const match of matches) {
          const position = indexToPosition(content, match.index, { oneBased: true });
          const fileRelative = path.relative(process.cwd(), file);

          const isDuplicate = results[matcher.title].instances.some(
            i => i.position.line === position.line && i.position.column === position.column && i.file === fileRelative,
          );

          if (!isDuplicate) {
            results[matcher.title].instances.push({
              sdk,
              position,
              file: fileRelative,
            });
          }
        }
      }
    }

    spinner.success(`Scanned ${files.length} files`);
    return Object.values(results);
  } catch (error) {
    spinner.error('Scan failed');
    throw error;
  }
}

function loadMatchers(config, sdk) {
  if (!config.changes) {
    return [];
  }

  return config.changes.filter(change => {
    if (!change.matcher) {
      return false;
    }

    const packages = change.packages || ['*'];
    return packages.includes('*') || packages.includes(sdk);
  });
}

function findMatches(content, matcher) {
  if (Array.isArray(matcher)) {
    return matcher.flatMap(m => Array.from(content.matchAll(m)));
  }
  return Array.from(content.matchAll(matcher));
}
