import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';

const reactRouterV7PackageJson = `{
  "name": "clerk-react-router-quickstart",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "react-router build",
    "dev": "react-router dev --port $PORT",
    "start": "NODE_ENV=production react-router-serve ./build/server/index.js",
    "typecheck": "react-router typegen && tsc --build --noEmit"
  },
  "dependencies": {
    "@react-router/node": "^7.9.1",
    "@react-router/serve": "^7.9.1",
    "isbot": "^5.1.17",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router": "^7.9.1"
  },
  "devDependencies": {
    "@react-router/dev": "^7.9.1",
    "@types/node": "^20",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "typescript": "^5.7.3",
    "vite": "^7.1.5",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
`;

const reactRouterV7Config = `import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  future: {
    v8_middleware: true,
    unstable_optimizeDeps: true,
  },
} satisfies Config;
`;

test.describe('React Router v7 compatibility @react-router', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.reactRouter.reactRouterNode
      .clone()
      .addFile('package.json', () => reactRouterV7PackageJson)
      .addFile('react-router.config.ts', () => reactRouterV7Config)
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();
  });

  test.afterAll(async () => {
    await app?.teardown();
  });

  test('redirects unauthenticated protected route requests through v7 middleware context', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/protected');

    await expect(u.page).toHaveURL(`${app.serverUrl}/sign-in`);
    await u.po.signIn.waitForMounted();
  });
});
