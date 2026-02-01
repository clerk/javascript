import { expect, test } from '@playwright/test';
import path from 'path';

import type { Application } from '../models/application';
import { stateFile } from '../models/stateFile';
import { appConfigs } from '../presets';
import { fs } from '../scripts';
import { createTestUtils } from '../testUtils';

function parseSemverMajor(range?: string): number | undefined {
  if (!range) {
    return undefined;
  }
  const match = String(range).match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : undefined;
}

/**
 * Detects the installed Next.js version for a given application.
 * Reads the version from node_modules/next/package.json to ensure
 * we get the actual installed version rather than a tag like "latest" or "canary".
 */
async function detectNext(app: Application): Promise<{ version: string | undefined | null }> {
  // app.appDir exists for normal Application; for long-running apps, read it from the state file by serverUrl
  const appDir =
    (app as any).appDir ||
    Object.values(stateFile.getLongRunningApps() || {}).find(a => a.serverUrl === app.serverUrl)?.appDir;

  if (!appDir) {
    return { version: null };
  }

  let installedVersion: string | undefined;
  try {
    const nextPkg = await fs.readJSON(path.join(appDir, 'node_modules', 'next', 'package.json'));
    installedVersion = String(nextPkg?.version || '');
  } catch {
    // ignore
  }

  console.log('---detectNext---', installedVersion);
  return { version: installedVersion };
}

const proxyFileContents = `
import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
`;

const commonSetup = appConfigs.next.appRouterQuickstart.clone().removeFile('src/proxy.ts');

test.describe('next start - missing proxy @quickstart', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000);
    app = await commonSetup.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodesQuickstart);
    await app.build();
    await app.serve();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Display error for missing proxy', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    expect(app.serveOutput).toContain('Your Proxy exists at ./src/proxy.(ts|js)');
  });
});

test.describe('next start - invalid proxy at root on src/ @quickstart', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000);
    app = await commonSetup.addFile('proxy.ts', () => proxyFileContents).commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodesQuickstart);
    await app.build();
    await app.serve();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Display suggestion for moving proxy from `./proxy.ts` to `./src/proxy.ts`', async ({ page, context }) => {
    const { version } = await detectNext(app);
    const major = parseSemverMajor(version) ?? 0;
    test.skip(major >= 16, 'Proxy detection is smarter in Next 16+.');
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    expect(app.serveOutput).not.toContain('Your Proxy exists at ./src/proxy.(ts|js)');
    expect(app.serveOutput).toContain(
      'Clerk: clerkMiddleware() was not run, your proxy file might be misplaced. Move your proxy file to ./src/proxy.ts. Currently located at ./proxy.ts',
    );
  });

  test('Does not display misplaced proxy error on Next 16+', async ({ page, context }) => {
    const { version } = await detectNext(app);
    const major = parseSemverMajor(version) ?? 0;
    test.skip(major < 16, 'Only applicable on Next 16+');
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    expect(app.serveOutput).not.toContain('Clerk: clerkMiddleware() was not run');
  });
});

test.describe('next start - invalid proxy inside app on src/ @quickstart', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000);
    app = await commonSetup.addFile('src/app/proxy.ts', () => proxyFileContents).commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodesQuickstart);
    await app.build();
    await app.serve();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Display suggestion for moving proxy from `./src/app/proxy.ts` to `./src/proxy.ts`', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    expect(app.serveOutput).not.toContain('Your Proxy exists at ./src/proxy.(ts|js)');
    expect(app.serveOutput).toContain(
      'Clerk: clerkMiddleware() was not run, your proxy file might be misplaced. Move your proxy file to ./src/proxy.ts. Currently located at ./src/app/proxy.ts',
    );
  });
});
