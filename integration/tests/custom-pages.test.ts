import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import type { CreateAppPageObjectArgs, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const CUSTOM_PROFILE_PAGE = '/custom-user-profile';
const CUSTOM_BUTTON_PAGE = '/custom-user-button';

async function waitForMountedComponent(
  component: 'UserButton' | 'UserProfile',
  u: ReturnType<
    typeof createTestUtils<
      {
        app: Application;
      } & CreateAppPageObjectArgs
    >
  >,
) {
  if (component === 'UserButton') {
    await u.page.goToRelative(CUSTOM_BUTTON_PAGE);
    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();
    await u.po.userButton.triggerManageAccount();
  } else {
    await u.page.goToRelative(CUSTOM_PROFILE_PAGE);
  }

  await u.po.userProfile.waitForMounted();
}

testAgainstRunningApps({ withPattern: ['react.vite.withEmailCodes'] })(
  'user profile custom pages @generic',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeUser = m.services.users.createFakeUser({
        withUsername: true,
        fictionalEmail: true,
        withPhoneNumber: true,
      });
      await m.services.users.createBapiUser({
        ...fakeUser,
        username: undefined,
        phoneNumber: undefined,
      });
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    (['UserButton', 'UserProfile'] as const).forEach(component => {
      test.describe(`Custom pages coming from <${component}/>`, () => {
        test('user profile has all custom pages with icons in the side nav with specified order', async ({
          page,
          context,
        }) => {
          const u = createTestUtils({ app, page, context });
          await u.po.signIn.goTo();
          await u.po.signIn.waitForMounted();
          await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
          await u.po.expect.toBeSignedIn();

          await waitForMountedComponent(component, u);

          await u.po.userProfile.waitForMounted();

          const pagesContainer = u.page.locator('div.cl-navbarButtons').first();

          const buttons = await pagesContainer.locator('button').all();

          expect(buttons.length).toBe(6);

          const expectedTexts = ['Profile', '🙃Page 1', 'Security', '🙃Page 2', '🌐Visit Clerk', '🌐Visit User page'];
          for (let i = 0; i < buttons.length; i++) {
            await expect(buttons[i]).toHaveText(expectedTexts[i]);
          }
        });

        test('user profile custom page 1', async ({ page, context }) => {
          const u = createTestUtils({ app, page, context });
          await u.po.signIn.goTo();
          await u.po.signIn.waitForMounted();
          await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
          await u.po.expect.toBeSignedIn();

          await waitForMountedComponent(component, u);

          const buttons = await u.page.locator('button.cl-navbarButton__custom-page-0').all();
          expect(buttons.length).toBe(1);
          const [profilePage] = buttons;

          await expect(profilePage.locator('div.cl-navbarButtonIcon__custom-page-0')).toHaveText('🙃');

          await profilePage.click();

          await u.page.waitForSelector('h1[data-page="1"]', { state: 'attached' });
          await u.page.waitForSelector('button[data-page="1"]', { state: 'attached' });
          await u.page.waitForSelector('p[data-page="1"]', { state: 'attached' });

          await expect(u.page.locator('p[data-page="1"]')).toHaveText('Counter: 0');
          u.page.locator('button[data-page="1"]').click();

          await expect(u.page.locator('p[data-page="1"]')).toHaveText('Counter: 1');
        });

        test('user profile custom external absolute link', async ({ page, context }) => {
          const u = createTestUtils({ app, page, context });
          await u.po.signIn.goTo();
          await u.po.signIn.waitForMounted();
          await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
          await u.po.expect.toBeSignedIn();

          await waitForMountedComponent(component, u);

          const buttons = await u.page.locator('button.cl-navbarButton__custom-page-3').all();
          expect(buttons.length).toBe(1);
          const [externalLink] = buttons;

          await expect(externalLink.locator('div.cl-navbarButtonIcon__custom-page-3')).toHaveText('🌐');
          await externalLink.click();
          await u.page.waitForURL('https://clerk.com');
        });

        test('user profile custom internal relative link', async ({ page, context }) => {
          const u = createTestUtils({ app, page, context });
          await u.po.signIn.goTo();
          await u.po.signIn.waitForMounted();
          await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
          await u.po.expect.toBeSignedIn();

          await waitForMountedComponent(component, u);

          const buttons = await u.page.locator('button.cl-navbarButton__custom-page-4').all();
          expect(buttons.length).toBe(1);
          const [externalLink] = buttons;

          await expect(externalLink.locator('div.cl-navbarButtonIcon__custom-page-4')).toHaveText('🌐');
          await externalLink.click();
          await u.page.waitForAppUrl('/user');
        });
      });
    });

    test.describe('User Button custom items', () => {
      test('items at the specified order', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.expect.toBeSignedIn();

        await u.page.goToRelative(CUSTOM_BUTTON_PAGE);
        await u.po.userButton.waitForMounted();
        await u.po.userButton.toggleTrigger();
        await u.po.userButton.waitForPopover();

        const pagesContainer = u.page.locator('div.cl-userButtonPopoverActions__multiSession').first();

        const buttons = await pagesContainer.locator('button').all();

        expect(buttons.length).toBe(6);

        const expectedTexts = [
          '🙃page-1',
          'Manage account',
          'Sign out',
          '🌐Visit Clerk',
          '🌐Visit User page',
          '🔔Custom Alert',
        ];
        for (let i = 0; i < buttons.length; i++) {
          await expect(buttons[i]).toHaveText(expectedTexts[i]);
        }
      });

      test('visit external absolute link', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.expect.toBeSignedIn();

        await u.page.goToRelative(CUSTOM_BUTTON_PAGE);
        await u.po.userButton.waitForMounted();
        await u.po.userButton.toggleTrigger();
        await u.po.userButton.waitForPopover();

        const buttons = await u.page.locator('button.cl-userButtonPopoverCustomItemButton__custom-menutItem-3').all();
        expect(buttons.length).toBe(1);
        const [externalLink] = buttons;

        await expect(
          externalLink.locator('span.cl-userButtonPopoverCustomItemButtonIconBox__custom-menutItem-3'),
        ).toHaveText('🌐');
        await externalLink.click();
        await u.page.waitForURL('https://clerk.com');
      });

      test('visit internal relative link', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.expect.toBeSignedIn();

        await u.page.goToRelative(CUSTOM_BUTTON_PAGE);
        await u.po.userButton.waitForMounted();
        await u.po.userButton.toggleTrigger();
        await u.po.userButton.waitForPopover();

        const buttons = await u.page.locator('button.cl-userButtonPopoverCustomItemButton__custom-menutItem-4').all();
        expect(buttons.length).toBe(1);
        const [externalLink] = buttons;

        await expect(
          externalLink.locator('span.cl-userButtonPopoverCustomItemButtonIconBox__custom-menutItem-4'),
        ).toHaveText('🌐');
        await externalLink.click();
        await u.page.waitForAppUrl('/user');
      });

      test('onClick custom item action', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.expect.toBeSignedIn();

        await u.page.goToRelative(CUSTOM_BUTTON_PAGE);
        await u.po.userButton.waitForMounted();
        await u.po.userButton.toggleTrigger();
        await u.po.userButton.waitForPopover();

        const buttons = await u.page.locator('button.cl-userButtonPopoverCustomItemButton__custom-menutItem-5').all();
        expect(buttons.length).toBe(1);
        const [action] = buttons;
        await expect(action.locator('span.cl-userButtonPopoverCustomItemButtonIconBox__custom-menutItem-5')).toHaveText(
          '🔔',
        );

        page.on('dialog', dialog => dialog.dismiss());

        const pendingDialog = u.page.waitForEvent('dialog');
        await action.click();
        await u.po.userButton.waitForPopoverClosed();
        await pendingDialog;
      });
    });
  },
);
