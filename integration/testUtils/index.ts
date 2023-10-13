import { Clerk } from '@clerk/backend';
import type { Browser, BrowserContext, Page } from '@playwright/test';

import type { Application } from '../models/application';
import { createAppPageObject } from './appPageObject';
import { createEmailService } from './emailService';
import type { EnchancedPage, TestArgs } from './signInPageObject';
import { createSignInComponentPageObject } from './signInPageObject';
import { createSignUpComponentPageObject } from './signUpPageObject';
import type { FakeUser } from './usersService';
import { createUserService } from './usersService';

export type { FakeUser };
const createClerkClient = (app: Application) => {
  return Clerk({
    secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
    publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
  });
};

const createExpectPageObject = ({ page }: TestArgs) => {
  return {
    toBeSignedOut: () => {
      return page.waitForFunction(() => {
        // @ts-ignore
        return !window.Clerk?.user;
      });
    },
    toBeSignedIn: async () => {
      return page.waitForFunction(() => {
        // @ts-ignore
        return !!window.Clerk?.user;
      });
    },
  };
};

type CreateAppPageObjectArgs = { page: Page; context: BrowserContext; browser: Browser };

export const createTestUtils = <
  Params extends { app: Application } & Partial<CreateAppPageObjectArgs>,
  Services = typeof services,
  PO = typeof pageObjects,
  BH = typeof browserHelpers,
  FullReturn = { services: Services; po: PO; tabs: BH; page: EnchancedPage },
  OnlyAppReturn = { services: Services },
>(
  params: Params,
): Params extends Partial<CreateAppPageObjectArgs> ? FullReturn : OnlyAppReturn => {
  const { app, context, browser } = params || {};

  const clerkClient = createClerkClient(app);
  const services = {
    email: createEmailService(),
    users: createUserService(clerkClient),
    clerk: clerkClient,
  };

  if (!params.page) {
    return { services } as any;
  }

  const page = createAppPageObject({ page: params.page }, app);
  const testArgs = { page, context, browser };

  const pageObjects = {
    signUp: createSignUpComponentPageObject(testArgs),
    signIn: createSignInComponentPageObject(testArgs),
    expect: createExpectPageObject(testArgs),
  };

  const browserHelpers = {
    runInNewTab: async (
      cb: (u: { services: Services; po: PO; page: EnchancedPage }, context: BrowserContext) => Promise<unknown>,
    ) => {
      const u = createTestUtils({ app, page: createAppPageObject({ page: await context.newPage() }, app) });
      await cb(u as any, context);
      return u;
    },
    runInNewBrowser: async (
      cb: (u: { services: Services; po: PO; page: EnchancedPage }, context: BrowserContext) => Promise<unknown>,
    ) => {
      if (!browser) {
        throw new Error('Browser is not defined. Did you forget to pass it to createPageObjects?');
      }
      const context = await browser.newContext();
      const u = createTestUtils({ app, page: createAppPageObject({ page: await context.newPage() }, app) });
      await cb(u as any, context);
      return u;
    },
  };

  return { page, services, po: pageObjects, tabs: browserHelpers } as any;
};

export { testAgainstRunningApps } from './testAgainstRunningApps';
