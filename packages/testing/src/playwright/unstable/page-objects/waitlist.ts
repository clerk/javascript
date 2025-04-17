import type { EnhancedPage } from './app';
import { common } from './common';

type WaitlistFormInputs = {
  email: string;
};

export const createWaitlistComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    goTo: async (opts?: { searchParams?: URLSearchParams; headlessSelector?: string }) => {
      await page.goToRelative('/waitlist', { searchParams: opts?.searchParams });

      if (typeof opts?.headlessSelector !== 'undefined') {
        return self.waitForMounted(opts.headlessSelector);
      }
      return self.waitForMounted();
    },
    waitForMounted: (selector = '.cl-waitlist-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    joinWaitlist: async (opts: WaitlistFormInputs) => {
      await self.getEmailAddressInput().fill(opts.email);

      await self.joinWaitlistContinue();
    },
    joinWaitlistContinue: () => {
      return page.getByRole('button', { name: 'Join the waitlist', exact: true }).click();
    },
  };

  return self;
};
