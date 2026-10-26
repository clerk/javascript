import type { Organization } from '@clerk/backend';
import type { BrowserContext, Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

type Surface = {
  name: string;
  path: string;
  navigation: string;
  secondPage: string;
};

const surfaces: Surface[] = [
  {
    name: 'UserProfile',
    path: '/user-profile',
    navigation: 'User profile',
    secondPage: 'Security',
  },
  {
    name: 'OrganizationProfile',
    path: '/organization-profile',
    navigation: 'Organization',
    secondPage: 'Members',
  },
];

testAgainstRunningApps({ withPattern: ['next.appRouterMosaic.*'] })(
  'Mosaic under React concurrent features @mosaic',
  ({ app }) => {
    let fakeUser: FakeUser;
    let organization: Organization;
    const cleanups: Array<() => Promise<unknown>> = [];

    test.beforeAll(async () => {
      const u = await createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser(test);
      cleanups.push(() => fakeUser.deleteIfExists());
      const user = await u.services.users.createBapiUser(fakeUser);
      organization = await u.services.clerk.organizations.createOrganization({
        name: `Mosaic ${Date.now()}`,
        createdBy: user.id,
      });
      cleanups.push(() => u.services.clerk.organizations.deleteOrganization(organization.id));
    });

    test.afterAll(async () => {
      const results = await Promise.allSettled(cleanups.map(cleanup => cleanup()));
      await app.teardown();
      const failures = results.flatMap(result => (result.status === 'rejected' ? [result.reason] : []));
      if (failures.length > 0) {
        throw new AggregateError(failures, 'Mosaic concurrency cleanup failed');
      }
    });

    async function signIn({ page, context }: { page: Page; context: BrowserContext }, path: string) {
      const u = await createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await page.evaluate(id => window.Clerk?.setActive({ organization: id }), organization.id);
      await u.page.goToRelative(path);
      await u.page.waitForClerkJsLoaded();
      return u;
    }

    for (const surface of surfaces) {
      test.describe(surface.name, () => {
        const tab = (page: Page, name: string) =>
          page.getByRole('navigation', { name: surface.navigation }).getByRole('tab', { name });

        async function openSurface({ page, context }: { page: Page; context: BrowserContext }, query = '') {
          await signIn({ page, context }, `${surface.path}${query}`);
          await expect(tab(page, surface.secondPage)).toBeVisible();
        }

        test('a host transition commits while a page is animating out', async ({ page, context }) => {
          await openSurface({ page, context });

          await tab(page, surface.secondPage).click();
          await host(page, 'Host transition');

          await expect(page.getByText('host-transitions-1')).toBeVisible();
          await tab(page, 'Custom page').click();
          await expect(page.getByText('profile-transitions-1')).toBeVisible();
        });

        test('hiding it in an Activity keeps the open page', async ({ page, context }) => {
          await openSurface({ page, context });

          await tab(page, surface.secondPage).click();
          await host(page, 'Hide surface');
          await expect(tab(page, surface.secondPage)).toBeHidden();
          await host(page, 'Show surface');

          await expect(tab(page, surface.secondPage)).toHaveAttribute('aria-selected', 'true');
        });

        test('restoring a dropped custom page returns to it', async ({ page, context }) => {
          await openSurface({ page, context });

          await tab(page, 'Custom page').click();
          await host(page, 'Drop custom page');
          await expect(tab(page, 'Custom page')).toHaveCount(0);
          await host(page, 'Restore custom page');

          await expect(page.getByText('custom-page-shown')).toBeVisible();
          await expect(tab(page, 'Custom page')).toHaveAttribute('aria-selected', 'true');
        });

        test('restoring a dropped custom page in a host transition returns to it', async ({ page, context }) => {
          await openSurface({ page, context });

          await tab(page, 'Custom page').click();
          await host(page, 'Drop custom page');
          await expect(tab(page, 'Custom page')).toHaveCount(0);
          await host(page, 'Restore custom page in transition');

          await expect(page.getByText('custom-page-shown')).toBeVisible();
          await expect(tab(page, 'Custom page')).toHaveAttribute('aria-selected', 'true');
        });

        test('a Next.js navigation that restores a dropped custom page returns to it', async ({ page, context }) => {
          await openSurface({ page, context }, '?extra=1');

          await tab(page, 'Extra page').click();
          await page.getByRole('link', { name: 'Drop extra page' }).click();
          await expect(page.getByText('extra-page-dropped')).toBeVisible();
          await page.getByRole('link', { name: 'Restore extra page' }).dispatchEvent('click');

          await expect(page.getByText('extra-page-shown')).toBeVisible();
          await expect(tab(page, 'Extra page')).toHaveAttribute('aria-selected', 'true');
        });

        test('a Next.js navigation from inside it leaves and comes back', async ({ page, context }) => {
          await openSurface({ page, context });

          await tab(page, 'Custom page').click();
          await page.getByRole('link', { name: 'Leave profile' }).click();
          await expect(page.getByText('custom-link-target')).toBeVisible();

          await page.goBack();
          await tab(page, surface.secondPage).click();
          await expect(tab(page, surface.secondPage)).toHaveAttribute('aria-selected', 'true');
        });
      });
    }

    test.describe('UserProfile add-email flow', () => {
      const verifyDialog = (page: Page) => page.getByRole('dialog', { name: 'Verify your email' });

      async function startAddingEmail({ page, context }: { page: Page; context: BrowserContext }) {
        await signIn({ page, context }, '/user-profile');
        const emailAddress = `mosaic-${Date.now()}+clerk_test@clerkcookie.com`;
        await page.getByRole('button', { name: 'Add email' }).click();
        await page.getByRole('textbox', { name: 'Email' }).fill(emailAddress);
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(verifyDialog(page)).toBeVisible();
        return emailAddress;
      }

      async function finishAddingEmail(page: Page, emailAddress: string) {
        const code = verifyDialog(page).getByRole('textbox', { name: 'Verification code' });
        await expect(code).not.toHaveAttribute('aria-disabled');
        await code.click();
        await page.keyboard.type('424242');
        await expect(verifyDialog(page)).toBeHidden();
        await page.waitForFunction(
          address =>
            window.Clerk?.user?.emailAddresses.find(email => email.emailAddress === address)?.verification.status ===
            'verified',
          emailAddress,
        );
      }

      test('hiding it in an Activity keeps the flow on its step', async ({ page, context }) => {
        const emailAddress = await startAddingEmail({ page, context });

        await hideAndShow(page, verifyDialog(page));

        await expect(verifyDialog(page)).toBeVisible();
        await finishAddingEmail(page, emailAddress);
      });

      test('a host Suspense boundary re-suspending keeps the flow on its step', async ({ page, context }) => {
        const emailAddress = await startAddingEmail({ page, context });

        await suspendAndResume(page);

        await expect(verifyDialog(page)).toBeVisible();
        await finishAddingEmail(page, emailAddress);
      });
    });

    test.describe('OrganizationProfile delete confirmation', () => {
      const deleteDialog = (page: Page) => page.getByRole('alertdialog', { name: 'Delete organization' });

      async function openDeleteDialog({ page, context }: { page: Page; context: BrowserContext }) {
        await signIn({ page, context }, '/organization-profile');
        await page.getByRole('button', { name: 'Delete organization' }).click();
        await expect(deleteDialog(page)).toBeVisible();
      }

      test('hiding it in an Activity keeps the dialog open', async ({ page, context }) => {
        await openDeleteDialog({ page, context });

        await hideAndShow(page, deleteDialog(page));

        await expect(deleteDialog(page)).toBeVisible();
      });

      test('a host Suspense boundary re-suspending keeps the dialog open', async ({ page, context }) => {
        await openDeleteDialog({ page, context });

        await suspendAndResume(page);

        await expect(deleteDialog(page)).toBeVisible();
      });
    });

    test.describe('UserButton popup', () => {
      async function openPopup({ page, context }: { page: Page; context: BrowserContext }) {
        await signIn({ page, context }, '/user-button');
        await userButtonTrigger(page).click();
        await expect(userButtonPopup(page)).toBeVisible();
      }

      test('hiding it in an Activity keeps the popup open', async ({ page, context }) => {
        await openPopup({ page, context });

        await hideAndShow(page, userButtonPopup(page));

        await expect(userButtonPopup(page)).toBeVisible();
      });

      test('a host Suspense boundary re-suspending keeps the popup open', async ({ page, context }) => {
        await openPopup({ page, context });

        await suspendAndResume(page);

        await expect(userButtonPopup(page)).toBeVisible();
      });
    });
  },
);

function userButtonTrigger(page: Page) {
  return page.getByRole('button', { name: /^Open account menu for / });
}

function userButtonPopup(page: Page) {
  return page.getByRole('dialog', { name: 'Account' });
}

async function host(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
}

async function hideAndShow(page: Page, hiddenWhileAway: Locator) {
  await host(page, 'Hide surface');
  await expect(hiddenWhileAway).toBeHidden();
  await host(page, 'Show surface');
}

async function suspendAndResume(page: Page) {
  await host(page, 'Suspend host');
  await expect(page.getByText('host-suspended')).toBeVisible();
  await host(page, 'Resume host');
  await expect(page.getByText('host-suspended')).toBeHidden();
}
