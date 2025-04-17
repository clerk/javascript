import type { EnhancedPage } from './app';

export const createClerkPageObject = ({ page }: { page: EnhancedPage }) => {
  return {
    toBeLoaded: async () => {
      return page.waitForFunction(() => {
        return !!window.Clerk?.loaded;
      });
    },
    getClientSideUser: () => {
      return page.evaluate(() => {
        return window.Clerk?.user;
      });
    },
  };
};
