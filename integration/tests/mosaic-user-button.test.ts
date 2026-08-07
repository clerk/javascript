import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUserWithEmail } from '../testUtils';
import { createTestUtils } from '../testUtils';

/**
 * E2E coverage for the experimental Mosaic `<UserButton />` exported from
 * `@clerk/nextjs/experimental/mosaic`.
 *
 * `packages/ui/src/mosaic/user-button/__tests__/` already covers the component against a mocked
 * Clerk: every rendered surface, every mapping, and every outbound call with its exact arguments.
 * None of that is repeated here. This suite asserts only what a mock cannot observe — whether Clerk
 * acted on the call, whether the server sees the result, and whether clerk-js renders into the DOM
 * the Mosaic tree hands it — plus the coexistence the migration depends on: legacy Emotion
 * components hotloaded from clerk-js running beside StyleX components bundled into the SDK.
 */

// The template's layout, plus the one line this suite adds. Its appearance options are what the
// shared sign-in page object's selectors depend on, so they are carried over verbatim.
const layout = () => `import './globals.css';
import '@clerk/nextjs/experimental/mosaic/styles.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mosaic UserButton',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      afterSignOutUrl='/mosaic'
      appearance={{
        options: {
          showOptionalFields: true,
          socialButtonsVariant: 'blockButton',
        },
      }}
    >
      <html lang='en'>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}`;

// Both UserButtons mount together while signed in, so every case below runs with the legacy Emotion
// tree and the Mosaic tree live at once rather than proving coexistence in one isolated smoke test.
const mosaicPage = () => `'use client';
import { UserButton } from '@clerk/nextjs/experimental/mosaic';
import { SignIn, Show, UserButton as LegacyUserButton } from '@clerk/nextjs';

export default function Page() {
  return (
    <main>
      <Show when='signed-in'>
        <UserButton
          userProfileProps={{
            customPages: [
              {
                path: 'usage',
                label: 'Usage',
                content: <p data-testid='mosaic-custom-page'>Mosaic custom page</p>,
              },
            ],
          }}
        />
        <LegacyUserButton />
      </Show>
      <Show when='signed-out'>
        <SignIn routing='hash' />
      </Show>
    </main>
  );
}`;

// The shared template's route answers with `userId` alone; the organization assertions need the
// rest of the auth object.
const meRoute = () => `import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId, orgId, orgRole, orgSlug } = await auth();
  return Response.json({
    userId: userId ?? null,
    orgId: orgId ?? null,
    orgRole: orgRole ?? null,
    orgSlug: orgSlug ?? null,
  });
}`;

test.describe('Mosaic UserButton @nextjs', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUserWithEmail;
  let otherUser: FakeUserWithEmail;
  let fakeOrganization: FakeOrganization;
  // Filled as each resource is created, so a setup that fails halfway still tears down what it made.
  const cleanup: (() => Promise<unknown>)[] = [];

  test.beforeAll(async () => {
    // Installing and booting a fresh app, before a single test runs.
    test.setTimeout(90_000);

    app = await appConfigs.next.appRouter
      .clone()
      // Deliberately no `.addDependency('@clerk/ui', PKGLAB)`, unlike composed-components.test.ts.
      // The Mosaic entry is bundled into @clerk/react at build time, so @clerk/nextjs alone has to
      // be enough. The absence of that line is what the last test in this file asserts.
      .addFile('src/app/layout.tsx', layout)
      .addFile('src/app/mosaic/page.tsx', mosaicPage)
      .addFile('src/app/api/me/route.ts', meRoute)
      .commit();
    cleanup.push(() => app.teardown());
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();

    const m = createTestUtils({ app });
    // Every account here is switched to by its email, so the optional field has to be there.
    const createUser = (): FakeUserWithEmail => {
      const user = m.services.users.createFakeUser();
      if (!user.email) {
        throw new Error('createFakeUser produced no email address');
      }
      return { ...user, email: user.email };
    };

    fakeUser = createUser();
    otherUser = createUser();
    const user = await m.services.users.createBapiUser(fakeUser);
    cleanup.unshift(() => fakeUser.deleteIfExists());
    await m.services.users.createBapiUser(otherUser);
    cleanup.unshift(() => otherUser.deleteIfExists());
    fakeOrganization = await m.services.users.createFakeOrganization(user.id);
    cleanup.unshift(() => fakeOrganization.delete());
  });

  test.afterAll(async () => {
    test.setTimeout(90_000);
    for (const teardown of cleanup) {
      await teardown();
    }
  });

  type AuthState = {
    userId: string | null;
    orgId: string | null;
    orgRole: string | null;
    orgSlug: string | null;
  };

  /**
   * What the server makes of the session cookie the browser is currently holding. The mocked vitest
   * suite can see the `setActive` argument; only this can see whether Clerk acted on it.
   */
  const readAuthState = async (page: Page): Promise<AuthState> => {
    const res = await page.request.get(new URL('/api/me', app.serverUrl).toString());
    expect(res.status()).toBe(200);
    const { userId, orgId, orgRole, orgSlug } = await res.json();
    return { userId, orgId, orgRole, orgSlug };
  };

  test('mounts beside the legacy UserButton, each popover opening on its own', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await context.clearCookies();

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/mosaic');
    await u.po.mosaicUserButton.waitForMounted();
    await u.po.userButton.waitForMounted();

    // The Mosaic popover opens without the legacy one following it, and vice versa. Two Floating UI
    // copies and two style systems in one tree.
    await u.po.mosaicUserButton.toggleTrigger();
    await u.po.mosaicUserButton.waitForPopover();
    await expect(page.locator('.cl-userButtonPopoverCard')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await u.po.mosaicUserButton.waitForPopoverClosed();

    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();
    await expect(u.po.mosaicUserButton.popup()).toHaveCount(0);
  });

  test('selecting the personal workspace, then the organization, reaches the server', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await context.clearCookies();

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/mosaic');
    await u.po.mosaicUserButton.waitForMounted();

    // The only organization is already active on sign-in, so its row is the current item rather than
    // a button. Personal is the reachable move first; the organization becomes selectable after it.
    await u.po.mosaicUserButton.expectTriggerLabel(fakeOrganization.name);

    await u.po.mosaicUserButton.toggleTrigger();
    await u.po.mosaicUserButton.waitForPopover();
    await u.po.mosaicUserButton.selectPersonalWorkspace();
    await u.po.mosaicUserButton.waitForPopoverClosed();

    await expect(async () => {
      expect((await readAuthState(page)).orgId).toBeNull();
    }).toPass();

    await u.po.mosaicUserButton.toggleTrigger();
    await u.po.mosaicUserButton.waitForPopover();
    await u.po.mosaicUserButton.selectWorkspace(fakeOrganization.name);
    await u.po.mosaicUserButton.waitForPopoverClosed();
    await u.po.mosaicUserButton.expectTriggerLabel(fakeOrganization.name);

    await expect(async () => {
      const auth = await readAuthState(page);
      expect(auth.orgId).toBe(fakeOrganization.organization.id);
      expect(auth.orgRole).toBe('org:admin');
      expect(auth.orgSlug).toBeTruthy();
    }).toPass();
  });

  test('switching accounts changes the session the server answers for', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await context.clearCookies();

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // Second sign-in adds a session rather than replacing it.
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(otherUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(otherUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();

    // Avoid backend rate-limiting on session touch.
    await new Promise(resolve => setTimeout(resolve, 3000));

    await u.page.goToRelative('/mosaic');
    await u.po.mosaicUserButton.waitForMounted();
    const before = await readAuthState(page);

    await u.po.mosaicUserButton.toggleTrigger();
    await u.po.mosaicUserButton.waitForPopover();
    await u.po.mosaicUserButton.switchAccount(fakeUser.email);

    await expect(async () => {
      const after = await readAuthState(page);
      expect(after.userId).toBeTruthy();
      expect(after.userId).not.toBe(before.userId);
    }).toPass();
  });

  test('signing out of every account hands the page back to the legacy SignIn', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await context.clearCookies();

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/mosaic');
    await u.po.mosaicUserButton.waitForMounted();

    await u.po.mosaicUserButton.toggleTrigger();
    await u.po.mosaicUserButton.waitForPopover();
    await u.po.mosaicUserButton.triggerSignOutAll();

    // `afterSignOutUrl` points back at this page, so what mounts is the legacy `<SignIn />` inside
    // `<SignedOut>`: a clerk-js component reacting to state a Mosaic component changed.
    await u.po.signIn.waitForMounted();
    await expect(async () => {
      expect((await readAuthState(page)).userId).toBeNull();
    }).toPass();
  });

  test('managing the account opens the clerk-js profile, with a custom page inside it', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await context.clearCookies();

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/mosaic');
    await u.po.mosaicUserButton.waitForMounted();

    await u.po.mosaicUserButton.toggleTrigger();
    await u.po.mosaicUserButton.waitForPopover();
    await u.po.mosaicUserButton.triggerManageAccount(fakeUser.email);

    // The modal is rendered by clerk-js, so the legacy page object is the right tool. Reaching it
    // from a Mosaic surface is the hand-off under test.
    await u.po.userProfile.waitForUserProfileModal();
    await u.po.userProfile.waitForMounted();

    // The Mosaic tree portals this node into a container clerk-js owns.
    await page.getByRole('button', { name: 'Usage' }).click();
    await expect(page.getByTestId('mosaic-custom-page')).toBeVisible();
  });

  // The Mosaic bundle is inlined into @clerk/react at build time. If it ever regresses to importing
  // @clerk/ui at runtime, every test above still passes here in the monorepo — where @clerk/ui is
  // always resolvable — and breaks only for consumers. This is the check that would catch it.
  test('reaches the mosaic entry without @clerk/ui anywhere in the app', async () => {
    // pnpm resolves `@clerk/react` beside `@clerk/nextjs` in the store rather than hoisting it to
    // the app's own `node_modules`, so it is reached through the installed package, not by name.
    const nextjsDir = realpathSync(path.join(app.appDir, 'node_modules', '@clerk', 'nextjs'));
    const dependenciesOf = (manifest: string): string[] => {
      expect(existsSync(manifest), `${manifest} is not installed in the test app`).toBe(true);
      return Object.keys(JSON.parse(readFileSync(manifest, 'utf-8')).dependencies ?? {});
    };

    expect(existsSync(path.join(app.appDir, 'node_modules', '@clerk', 'ui'))).toBe(false);
    expect(dependenciesOf(path.join(nextjsDir, 'package.json'))).not.toContain('@clerk/ui');
    expect(dependenciesOf(path.join(nextjsDir, '..', 'react', 'package.json'))).not.toContain('@clerk/ui');
  });
});
