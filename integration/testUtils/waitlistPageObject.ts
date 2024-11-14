import { common } from './commonPageObject';
import type { TestArgs } from './signInPageObject';

type WaitlistFormInputs = {
  email: string;
};

export const createWaitlistComponentPageObject = (testArgs: TestArgs) => {
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
