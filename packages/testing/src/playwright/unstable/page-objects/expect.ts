import type { Response } from '@playwright/test';
import { expect } from '@playwright/test';

import type { EnhancedPage } from './app';

export const createExpectPageObject = ({ page }: { page: EnhancedPage }) => {
  return {
    toBeHandshake: async (res: Response) => {
      // Travel the redirect chain until we find the handshake header
      // TODO: Loop through the redirects until we find a handshake header, or timeout trying
      const redirect = await res.request().redirectedFrom()?.redirectedFrom()?.response();
      expect(redirect?.status()).toBe(307);
      expect(redirect?.headers()['x-clerk-auth-status']).toContain('handshake');
    },
    toBeSignedOut: (args?: { timeOut: number }) => {
      return page.waitForFunction(
        () => {
          return window.Clerk?.user === null;
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
    toBeSignedInAsActor: async () => {
      return page.waitForFunction(() => {
        return !!window.Clerk?.session?.actor;
      });
    },
    toHaveResolvedTask: async () => {
      return page.waitForFunction(() => {
        return !window.Clerk?.session?.currentTask;
      });
    },
  };
};
