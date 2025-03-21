import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

const middlewareFileContents = `
import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
`;

const commonSetup = appConfigs.next.appRouterQuickstart.clone().removeFile('src/middleware.ts');

test.describe('next start - missing middleware @quickstart', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await commonSetup.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodesQuickstart);
    await app.build();
    await app.serve();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Display error for missing middleware', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    expect(app.serveOutput).toContain('Your Middleware exists at ./src/middleware.(ts|js)');
  });
});

test.describe('next start - invalid middleware at root on src/ @quickstart', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await commonSetup.addFile('middleware.ts', () => middlewareFileContents).commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodesQuickstart);
    await app.build();
    await app.serve();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Display suggestion for moving middleware to from `./middleware.ts` to `./src/middleware.ts`', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    expect(app.serveOutput).not.toContain('Your Middleware exists at ./src/middleware.(ts|js)');
    expect(app.serveOutput).toContain(
      'Clerk: clerkMiddleware() was not run, your middleware file might be misplaced. Move your middleware file to ./src/middleware.ts. Currently located at ./middleware.ts',
    );
  });
});

test.describe('next start - invalid middleware inside app on src/ @quickstart', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await commonSetup.addFile('src/app/middleware.ts', () => middlewareFileContents).commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodesQuickstart);
    await app.build();
    await app.serve();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Display suggestion for moving middleware to from `./src/app/middleware.ts` to `./src/middleware.ts`', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    expect(app.serveOutput).not.toContain('Your Middleware exists at ./src/middleware.(ts|js)');
    expect(app.serveOutput).toContain(
      'Clerk: clerkMiddleware() was not run, your middleware file might be misplaced. Move your middleware file to ./src/middleware.ts. Currently located at ./src/app/middleware.ts',
    );
  });
});
