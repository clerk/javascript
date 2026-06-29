import { createClerkClient as backendCreateClerkClient } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';
import {
  createAppPageObject,
  createPageObjects,
  type EnhancedPage,
  type PlaywrightSetupClerkTestingTokenOptions,
} from '@clerk/testing/playwright/unstable';
import type { Browser, BrowserContext, Page } from '@playwright/test';

import type { Application } from '../models/application';
import { createEmailService } from './emailService';
import { createInvitationService } from './invitationsService';
import { createOrganizationsService } from './organizationsService';
import { withRetry } from './retryableClerkClient';
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

// One testing token per instance (keyed by publishable key), minted lazily on the first
// FAPI request a test intercepts and shared across tests in this worker process.
const testingTokenCache = new Map<string, Promise<string | undefined>>();

const getTestingToken = (
  app: Application,
  clerkClient: ReturnType<typeof createClerkClient>,
  publishableKey: string,
): Promise<string | undefined> => {
  let promise = testingTokenCache.get(publishableKey);
  if (!promise) {
    promise = clerkClient.testingTokens
      .createTestingToken()
      .then(({ token }) => token)
      .catch(err => {
        console.warn(
          `Failed to mint a testing token for app "${app.name}". Falling back to the CLERK_TESTING_TOKEN env var.`,
          err,
        );
        // Evict so the next test re-attempts the mint; otherwise one transient
        // failure would pin the env-var fallback for the whole worker process.
        testingTokenCache.delete(publishableKey);
        return undefined;
      });
    testingTokenCache.set(publishableKey, promise);
  }
  return promise;
};

// Builds per-app options so the testing-token bypass targets the instance THIS app talks
// to, instead of the process-global CLERK_FAPI (which holds whichever app ran clerkSetup
// last and silently misses every other instance, e.g. captcha-enabled ones).
const createTestingTokenOptions = (
  app: Application,
  clerkClient: ReturnType<typeof createClerkClient>,
): PlaywrightSetupClerkTestingTokenOptions | undefined => {
  const publishableKey = app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
  const parsedKey = publishableKey ? parsePublishableKey(publishableKey) : null;
  if (!publishableKey || parsedKey?.instanceType !== 'development') {
    return undefined;
  }
  return {
    frontendApiUrl: parsedKey.frontendApi,
    testingToken: () => getTestingToken(app, clerkClient, publishableKey),
  };
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

  const clerkClient = withRetry(createClerkClient(app));
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

  const testingTokenOptions = createTestingTokenOptions(app, clerkClient);
  const pageObjects = createPageObjects({
    page: params.page,
    useTestingToken,
    baseURL: app.serverUrl,
    testingTokenOptions,
  });

  const browserHelpers = {
    runInNewTab: async (
      cb: (u: { services: Services; po: PO; page: EnhancedPage }, context: BrowserContext) => Promise<unknown>,
    ) => {
      const u = createTestUtils({
        app,
        page: createAppPageObject(
          { page: await context.newPage(), useTestingToken, testingTokenOptions },
          { baseURL: app.serverUrl },
        ),
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
        page: createAppPageObject(
          { page: await context.newPage(), useTestingToken, testingTokenOptions },
          { baseURL: app.serverUrl },
        ),
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
