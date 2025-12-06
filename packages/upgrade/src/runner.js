import fs from 'node:fs/promises';
import path from 'node:path';

import { convertPathToPattern, globby } from 'globby';
import indexToPosition from 'index-to-position';

import { runCodemod } from './codemods/index.js';
import { createSpinner, renderCodemodResults, renderManualInterventionSummary } from './render.js';

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
  '**/*.(png|webp|svg|gif|jpg|jpeg)+',
  '**/*.(mp4|mkv|wmv|m4v|mov|avi|flv|webm|flac|mka|m4a|aac|ogg)+',
];

export async function runCodemods(config, sdk, options) {
  const codemods = config.codemods || [];

  if (codemods.length === 0) {
    return;
  }

  const glob = typeof options.glob === 'string' ? options.glob.split(/[ ,]/).filter(Boolean) : options.glob;

  for (const transform of codemods) {
    const spinner = createSpinner(`Running codemod: ${transform}`);

    try {
      const result = await runCodemod(transform, glob, options);
      spinner.success(`Codemod complete: ${transform}`);
      renderCodemodResults(transform, result);

      if (transform === 'transform-remove-deprecated-props' && result.stats) {
        renderManualInterventionSummary(result.stats);
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
    const pattern = convertPathToPattern(path.resolve(options.dir));
    const files = await globby(pattern, {
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
