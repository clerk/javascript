import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
import { name, version } from './package.json';

async function addJsExtensionsToEsmFiles() {
  const distDir = './dist/esm';

  async function findJsFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findJsFiles(fullPath)));
      } else if (entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  function addJsExtensions(content: string): string {
    return content.replace(/from\s+['"](\.\.?\/[^'"]*?)['"]/g, (match, importPath) => {
      if (importPath.match(/\.[a-zA-Z0-9]+$/)) {
        return match;
      }
      return `from '${importPath}.js'`;
    });
  }

  try {
    const files = await findJsFiles(distDir);
    let processedCount = 0;

    for (const file of files) {
      const content = await readFile(file, 'utf8');
      const updatedContent = addJsExtensions(content);

      if (content !== updatedContent) {
        await writeFile(file, updatedContent);
        processedCount++;
      }
    }

    if (processedCount > 0) {
      console.log(`Added .js extensions to ${processedCount} ESM files`);
    }
  } catch (error) {
    console.error('Error adding .js extensions:', error);
  }
}

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: [
      './src/**/*.{ts,tsx,js,jsx}',
      '!./src/**/*.test.{ts,tsx}',
      '!./src/**/server-actions.ts',
      '!./src/**/keyless-actions.ts',
      '!./src/vendor/**',
    ],
    // We want to preserve original file structure
    // so that the "use client" directives are not lost
    // and make debugging easier via node_modules easier
    bundle: false,
    clean: true,
    minify: false,
    external: ['#safe-node-apis'],
    sourcemap: true,
    legacyOutput: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };

  const esm: Options = {
    ...common,
    format: 'esm',
    outExtension: () => ({
      js: '.js',
    }),
    onSuccess: addJsExtensionsToEsmFiles,
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
  };

  /**
   * When server actions are built with sourcemaps, Next.js does not resolve the sourcemap URLs during build and so browser dev tools attempt to load source maps for these files from incorrect locations
   */
  const serverActionsEsm: Options = {
    ...esm,
    entry: ['./src/**/server-actions.ts', './src/**/keyless-actions.ts'],
    sourcemap: false,
  };

  const serverActionsCjs: Options = {
    ...cjs,
    entry: ['./src/**/server-actions.ts', './src/**/keyless-actions.ts'],
    sourcemap: false,
  };

  /**
   * We vendor certain dependencies to control the output and minimize transitive dependency surface area.
   */
  const vendorsEsm: Options = {
    ...esm,
    entry: ['./src/vendor/crypto-es.js'],
    outDir: './dist/esm/vendor',
  };

  const vendorsCjs: Options = {
    ...cjs,
    entry: ['./src/vendor/crypto-es.js'],
    outDir: './dist/cjs/vendor',
  };

  const copyPackageJson = (format: 'esm' | 'cjs') => `cp ./package.${format}.json ./dist/${format}/package.json`;
  // Tsup will not output the generated file in the same location as the source file
  // So we need to move the server-actions.js file to the app-router folder manually
  // Happy to improve this if there is a better way
  const moveServerActions = (format: 'esm' | 'cjs') =>
    `mv ./dist/${format}/server-actions.js ./dist/${format}/app-router`;
  const moveKeylessActions = (format: 'esm' | 'cjs') =>
    `mv ./dist/${format}/keyless-actions.js ./dist/${format}/app-router`;

  return runAfterLast([
    'pnpm build:declarations',
    copyPackageJson('esm'),
    copyPackageJson('cjs'),
    moveServerActions('esm'),
    moveServerActions('cjs'),
    moveKeylessActions('esm'),
    moveKeylessActions('cjs'),
    shouldPublish && 'pnpm publish:local',
  ])(esm, cjs, serverActionsEsm, serverActionsCjs, vendorsEsm, vendorsCjs);
});
