import type { EnhancedPage } from './app';

export const createClerkPageObject = ({ page }: { page: EnhancedPage }) => {
  return {
    toBeLoaded: async () => {
      return page.waitForFunction(() => {
        return !!window.Clerk?.loaded;
      });
    },
    getClientSideActor: () => {
      return page.evaluate(() => {
        return window.Clerk?.session?.actor;
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
