import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('Waitlist mode', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/provider.tsx',
        () => `'use client'
    import { ClerkProvider } from "@clerk/nextjs";
    
    export function Provider({ children }: { children: any }) {
      return (
        <ClerkProvider waitlistUrl='/waitlist'>
          {children}
        </ClerkProvider>
      )
    }`,
      )
      .addFile(
        'src/app/layout.tsx',
        () => `import './globals.css';
    import { Inter } from 'next/font/google';
    import { Provider } from './provider';
    
    const inter = Inter({ subsets: ['latin'] });
    
    export const metadata = {
      title: 'Create Next App',
      description: 'Generated by create next app',
    };
    
    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <Provider>
          <html lang='en'>
            <body className={inter.className}>{children}</body>
          </html>
        </Provider>
      );
    }`,
      )
      .addFile(
        'src/app/hash/user/page.tsx',
        () => `
    import { UserProfile, UserButton } from '@clerk/nextjs';
    
    export default function Page() {
      return (
        <div>
          <UserButton />
          <UserProfile routing="hash" />
        </div>
      );
    }`,
      )
      .addFile(
        'src/app/waitlist/page.tsx',
        () => `
    import { Waitlist } from '@clerk/nextjs';
    
    export default function Page() {
      return (
        <div>
          <Waitlist />
        </div>
      );
    }`,
      )
      .commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withWaitlistdMode);
    await app.dev();

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

  test('Existing user signs in succesfull', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.userProfile.goTo();
    await u.po.userProfile.waitForMounted();
  });

  test('Sign up page return restricted and click Back to sign in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signUp.goTo();
    await u.po.signUp.waitForMounted();

    await expect(u.page.getByText(/Access restricted/i).first()).toBeVisible();
    const backToSignIn = u.page.getByRole('link', { name: /Sign in/i });
    await backToSignIn.click();

    await u.po.signIn.waitForMounted();
    await u.page.waitForAppUrl('/sign-in');
  });

  test('Sign up page with invitation render correctly and sign up', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const invitedUser = u.services.users.createFakeUser();

    const invitation = await u.services.invitations.createBapiInvitation(invitedUser.email);

    await u.page.goto(invitation.url);
    await u.po.signUp.waitForMounted();
    await expect(u.page.getByText(/Create your account/i).first()).toBeVisible();

    await u.po.signUp.signUp({
      password: invitedUser.password,
    });

    await u.po.expect.toBeSignedIn();

    await invitedUser.deleteIfExists();
  });

  test('Navigate to waitlist page and join the waitlist', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.waitlist.goTo();
    await u.po.waitlist.waitForMounted();

    await expect(u.page.getByText(/Join the waitlist/i).first()).toBeVisible();

    await u.po.waitlist.joinWaitlist({ email: fakeUser.email });
    await expect(u.page.getByText(/Thanks for joining the waitlist!/i).first()).toBeVisible();
  });

  test('Navigate between sign-in and waitlist', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();

    const waitlistLink = u.page.getByRole('link', { name: /Join waitlist/i });
    await expect(waitlistLink).toBeVisible();
    await waitlistLink.click();

    await u.po.waitlist.waitForMounted();
    await u.page.waitForAppUrl('/waitlist');

    const signInList = u.page.getByRole('link', { name: /Sign in/i });
    await expect(signInList).toBeVisible();
    await signInList.click();

    await u.po.signIn.waitForMounted();
    await u.page.waitForAppUrl('/sign-in');
  });
});
