import { createClerkClient as backendCreateClerkClient } from '@clerk/backend';
import { createAppPageObject, createPageObjects, type EnhancedPage } from '@clerk/testing/playwright/unstable';
import type { Browser, BrowserContext, Page } from '@playwright/test';

import type { Application } from '../models/application';
import { createEmailService } from './emailService';
import { createInvitationService } from './invitationsService';
import { createOrganizationsService } from './organizationsService';
import type { FakeAPIKey, FakeOrganization, FakeUser, FakeUserWithEmail } from './usersService';
import { createUserService } from './usersService';
import { createWaitlistService } from './waitlistService';

export type { FakeAPIKey, FakeOrganization, FakeUser, FakeUserWithEmail };

const createClerkClient = (app: Application) => {
  return backendCreateClerkClient({
    apiUrl: app.env.privateVariables.get('CLERK_API_URL'),
    secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
    publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
  });
};

export type CreateAppPageObjectArgs = { page: Page; context: BrowserContext; browser: Browser };

export const createTestUtils = <
  Params extends { app: Application; useTestingToken?: boolean } & Partial<CreateAppPageObjectArgs>,
  Services = typeof services,
  PO = typeof pageObjects,
  BH = typeof browserHelpers,
  FullReturn = { services: Services; po: PO; tabs: BH; page: EnhancedPage; nextJsVersion: string },
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
    waitlist: createWaitlistService(clerkClient),
  };

  if (!params.page) {
    return { services } as any;
  }

  const pageObjects = createPageObjects({ page: params.page, useTestingToken, baseURL: app.serverUrl });

  const browserHelpers = {
    runInNewTab: async (
      cb: (u: { services: Services; po: PO; page: EnhancedPage }, context: BrowserContext) => Promise<unknown>,
    ) => {
      const u = createTestUtils({
        app,
        page: createAppPageObject({ page: await context.newPage(), useTestingToken }, { baseURL: app.serverUrl }),
      });
      await cb(u as any, context);
      return u;
    },
    runInNewBrowser: async (
      cb: (u: { services: Services; po: PO; page: EnhancedPage }, context: BrowserContext) => Promise<unknown>,
    ) => {
      if (!browser) {
        throw new Error('Browser is not defined. Did you forget to pass it to createPageObjects?');
      }
      const context = await browser.newContext();
      const u = createTestUtils({
        app,
        page: createAppPageObject({ page: await context.newPage(), useTestingToken }, { baseURL: app.serverUrl }),
      });
      await cb(u as any, context);
      return u;
    },
  };

  return {
    page: pageObjects.page,
    services,
    po: pageObjects,
    tabs: browserHelpers,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    nextJsVersion: process.env.E2E_NEXTJS_VERSION,
  } as any;
};

export { testAgainstRunningApps } from './testAgainstRunningApps';
