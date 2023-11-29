import { defineConfig } from 'tsup';

export default defineConfig(_overrideOptions => {
  const uiRetheme = process.env.CLERK_RETHEME === '1' || process.env.CLERK_RETHEME === 'true';

  return {
    entry: uiRetheme
      ? ['src', '!src/index.ts', '!src/en-US.ts']
      : ['src', '!src/index.retheme.ts', '!src/en-US.retheme.ts'],
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    splitting: false,
  };
});
