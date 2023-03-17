import { defineConfig } from 'tsup';

export default defineConfig(options => {
  return {
    clean: true,
    entry: [
      'src/index.ts',
      'src/ssr/index.ts',
      'src/server/index.ts',
      'src/api/index.ts',
      'src/edge-middleware/index.ts',
      'src/app-beta/index.ts',
      'src/constants.ts',
    ],
    onSuccess: 'tsc --emitDeclarationOnly --declaration',
    minify: !options.watch,
    sourcemap: true,
    format: ['cjs', 'esm'],
    legacyOutput: true,
  };
});
