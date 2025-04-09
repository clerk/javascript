import { createClerkClient as backendCreateClerkClient } from '@clerk/backend';
import { setupClerkTestingToken } from '@clerk/testing/playwright';
import type { Browser, BrowserContext, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';

import type { Application } from '../models/application';
import { createAppPageObject } from './appPageObject';
import { createEmailService } from './emailService';
import { createInvitationService } from './invitationsService';
import { createKeylessPopoverPageObject } from './keylessPopoverPageObject';
import { createOrganizationsService } from './organizationsService';
import { createOrganizationSwitcherComponentPageObject } from './organizationSwitcherPageObject';
import { createSessionTaskComponentPageObject } from './sessionTaskPageObject';
import type { EnchancedPage, TestArgs } from './signInPageObject';
import { createSignInComponentPageObject } from './signInPageObject';
import { createSignUpComponentPageObject } from './signUpPageObject';
import { createUserButtonPageObject } from './userButtonPageObject';
import { createUserProfileComponentPageObject } from './userProfilePageObject';
import type { FakeOrganization, FakeUser } from './usersService';
import { createUserService } from './usersService';
import { createUserVerificationComponentPageObject } from './userVerificationPageObject';
import { createWaitlistComponentPageObject } from './waitlistPageObject';

export type { FakeUser, FakeOrganization };
const createClerkClient = (app: Application) => {
  return backendCreateClerkClient({
    apiUrl: app.env.privateVariables.get('CLERK_API_URL'),
    secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
    publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
  });
};

const createExpectPageObject = ({ page }: TestArgs) => {
  return {
    toBeHandshake: async (res: Response) => {
      // Travel the redirect chain until we find the handshake header
      // TODO: Loop through the redirects until we find a handshake header, or timeout trying
      const redirect = await res.request().redirectedFrom().redirectedFrom().response();
      expect(redirect.status()).toBe(307);
      expect(redirect.headers()['x-clerk-auth-status']).toContain('handshake');
    },
    toBeSignedOut: (args?: { timeOut: number }) => {
      return page.waitForFunction(
        () => {
          return !window.Clerk?.user;
        },
        null,
        { timeout: args?.timeOut },
      );
    },
    toBeSignedIn: async () => {
      return page.waitForFunction(() => {
        return !!window.Clerk?.user;
      });
    },
    toHaveResolvedTask: async () => {
      return page.waitForFunction(() => {
        return !window.Clerk?.session?.currentTask;
      });
    },
  };
};

const createClerkUtils = ({ page }: TestArgs) => {
  return {
    toBeLoaded: async () => {
      return page.waitForFunction(() => {
        return !!window.Clerk?.loaded;
      });
    },
    toBeLoading: async () => {
      return page.waitForFunction(() => {
        return window.Clerk?.status === 'loading';
      });
    },
    toBeReady: async () => {
      return page.waitForFunction(() => {
        return window.Clerk?.status === 'ready';
      });
    },
    toBeDegraded: async () => {
      return page.waitForFunction(() => {
        return window.Clerk?.status === 'degraded';
      });
    },
    getClientSideUser: () => {
      return page.evaluate(() => {
        return window.Clerk?.user;
      });
    },
  };
};

const createTestingTokenUtils = ({ page }: TestArgs) => {
  return {
    setup: async () => setupClerkTestingToken({ page }),
  };
};

export type CreateAppPageObjectArgs = { page: Page; context: BrowserContext; browser: Browser };

export const createTestUtils = <
  Params extends { app: Application; useTestingToken?: boolean } & Partial<CreateAppPageObjectArgs>,
  Services = typeof services,
  PO = typeof pageObjects,
  BH = typeof browserHelpers,
  FullReturn = { services: Services; po: PO; tabs: BH; page: EnchancedPage; nextJsVersion: string },
  OnlyAppReturn = { services: Services },
>(
  params: Params,
): Params extends Partial<CreateAppPageObjectArgs> ? FullReturn : OnlyAppReturn => {
  const { app, context, browser, useTestingToken = true } = params || {};

  const clerkClient = createClerkClient(app);
  const services = {
    clerk: clerkClient,
    email: createEmailService(),
    users: createUserService(clerkClient),
    invitations: createInvitationService(clerkClient),
    organizations: createOrganizationsService(clerkClient),
  };

  if (!params.page) {
    return { services } as any;
  }

  const page = createAppPageObject({ page: params.page, useTestingToken }, app);
  const testArgs = { page, context, browser };

  const pageObjects = {
    clerk: createClerkUtils(testArgs),
    expect: createExpectPageObject(testArgs),
    keylessPopover: createKeylessPopoverPageObject(testArgs),
    organizationSwitcher: createOrganizationSwitcherComponentPageObject(testArgs),
    sessionTask: createSessionTaskComponentPageObject(testArgs),
    signIn: createSignInComponentPageObject(testArgs),
    signUp: createSignUpComponentPageObject(testArgs),
    testingToken: createTestingTokenUtils(testArgs),
    userButton: createUserButtonPageObject(testArgs),
    userProfile: createUserProfileComponentPageObject(testArgs),
    userVerification: createUserVerificationComponentPageObject(testArgs),
    waitlist: createWaitlistComponentPageObject(testArgs),
  };

  const browserHelpers = {
    runInNewTab: async (
      cb: (u: { services: Services; po: PO; page: EnchancedPage }, context: BrowserContext) => Promise<unknown>,
    ) => {
      const u = createTestUtils({
        app,
        page: createAppPageObject({ page: await context.newPage(), useTestingToken }, app),
      });
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
      const u = createTestUtils({
        app,
        page: createAppPageObject({ page: await context.newPage(), useTestingToken }, app),
      });
      await cb(u as any, context);
      return u;
    },
  };

  return {
    page,
    services,
    po: pageObjects,
    tabs: browserHelpers,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    nextJsVersion: process.env.E2E_NEXTJS_VERSION,
  } as any;
};

export { testAgainstRunningApps } from './testAgainstRunningApps';
