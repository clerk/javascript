import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'node22',
  external: ['@google-cloud/storage', 'fs', 'path', 'crypto', 'child_process', 'util'],
  esbuildOptions(options) {
    options.banner = {
      js: `import { createRequire as __createRequire } from 'module';const require = __createRequire(import.meta.url);`,
    };
  },
});
