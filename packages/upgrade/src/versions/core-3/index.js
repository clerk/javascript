export default {
  id: 'core-3',
  name: 'Core 3',
  docsUrl: 'https://clerk.com/docs/upgrade-guides/core-3',
  sdkVersions: {
    nextjs: { from: 6, to: 7 },
    react: { from: 5, to: 7 },
    expo: { from: 2, to: 3 },
    'react-router': { from: 2, to: 3 },
    'tanstack-react-start': { from: 0, to: 1 },
    astro: { from: 2, to: 3 },
    nuxt: { from: 2, to: 3 },
    vue: { from: 2, to: 3 },
  },
  codemods: [
    'transform-clerk-react-v6',
    'transform-remove-deprecated-props',
    'transform-remove-deprecated-appearance-props',
    'transform-appearance-layout-to-options',
    'transform-themes-to-ui-themes',
    'transform-align-experimental-unstable-prefixes',
    // React/JSX version of Protect→Show (handles .tsx, .jsx, .ts, .js files)
    {
      name: 'transform-protect-to-show',
      packages: ['nextjs', 'react', 'expo', 'react-router', 'tanstack-react-start', 'astro'],
    },
    // Vue SFC version of Protect→Show (handles .vue files)
    { name: 'transform-protect-to-show-vue', packages: ['vue', 'nuxt'] },
    { name: 'transform-clerk-provider-inside-body', packages: ['nextjs'] },
    // Migrate @clerk/react-router/api.server → @clerk/react-router/server
    { name: 'transform-react-router-api-server', packages: ['react-router'] },
  ],
};
