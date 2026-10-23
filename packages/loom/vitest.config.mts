import { createRequire } from 'node:module';

import { defineConfig } from 'vitest/config';

const requireNext = createRequire(new URL('../swingset/package.json', import.meta.url));
const compiled = (entry: string) => requireNext.resolve(`next/dist/compiled/${entry}`);

const streamingReact = {
  alias: [
    { find: /^react$/, replacement: compiled('react') },
    { find: /^react\/(.*)$/, replacement: `${compiled('react').replace(/index\.js$/, '')}$1` },
    { find: /^react-dom$/, replacement: compiled('react-dom') },
    { find: /^react-dom\/(.*)$/, replacement: `${compiled('react-dom').replace(/index\.js$/, '')}$1` },
  ],
};

export default defineConfig({
  test: {
    environment: 'node',
    projects: [
      { extends: true, test: { name: 'core', include: ['src/**/*.test.ts'] } },
      {
        extends: true,
        test: {
          name: 'react',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          exclude: ['src/**/*.streaming.test.tsx', 'src/**/*.streaming-ssr.test.tsx'],
        },
      },
      {
        extends: true,
        resolve: streamingReact,
        test: {
          name: 'streaming',
          environment: 'jsdom',
          include: ['src/**/*.streaming.test.tsx'],
        },
      },
      {
        extends: true,
        resolve: streamingReact,
        test: {
          name: 'streaming-ssr',
          environment: 'node',
          include: ['src/**/*.streaming-ssr.test.tsx'],
        },
      },
    ],
  },
});
