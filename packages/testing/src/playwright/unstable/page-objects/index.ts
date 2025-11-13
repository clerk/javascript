import type { Page } from '@playwright/test';

import { createAPIKeysComponentPageObject } from './apiKeys';
import { createAppPageObject } from './app';
import { createCheckoutPageObject } from './checkout';
import { createClerkPageObject } from './clerk';
import { createExpectPageObject } from './expect';
import { createImpersonationPageObject } from './impersonation';
import { createKeylessPopoverPageObject } from './keylessPopover';
import { createOrganizationSwitcherComponentPageObject } from './organizationSwitcher';
import { createPlanDetailsPageObject } from './planDetails';
import { createPricingTablePageObject } from './pricingTable';
import { createSessionTaskComponentPageObject } from './sessionTask';
import { createSignInComponentPageObject } from './signIn';
import { createSignUpComponentPageObject } from './signUp';
import { createSubscriptionDetailsPageObject } from './subscriptionDetails';
import { createTestingTokenPageObject } from './testingToken';
import { createUserAvatarPageObject } from './userAvatar';
import { createUserButtonPageObject } from './userButton';
import { createUserProfileComponentPageObject } from './userProfile';
import { createUserVerificationComponentPageObject } from './userVerification';
import { createWaitlistComponentPageObject } from './waitlist';

export const createPageObjects = ({
  page,
  useTestingToken = true,
  baseURL,
}: {
  page: Page;
  useTestingToken?: boolean;
  baseURL?: string;
}) => {
  const app = createAppPageObject({ page, useTestingToken }, { baseURL });
  const testArgs = { page: app };

  return {
    page: app,
    clerk: createClerkPageObject(testArgs),
    checkout: createCheckoutPageObject(testArgs),
    expect: createExpectPageObject(testArgs),
    impersonation: createImpersonationPageObject(testArgs),
    keylessPopover: createKeylessPopoverPageObject(testArgs),
    organizationSwitcher: createOrganizationSwitcherComponentPageObject(testArgs),
    pricingTable: createPricingTablePageObject(testArgs),
    sessionTask: createSessionTaskComponentPageObject(testArgs),
    signIn: createSignInComponentPageObject(testArgs),
    signUp: createSignUpComponentPageObject(testArgs),
    testingToken: createTestingTokenPageObject(testArgs),
    userAvatar: createUserAvatarPageObject(testArgs),
    userButton: createUserButtonPageObject(testArgs),
    userProfile: createUserProfileComponentPageObject(testArgs),
    userVerification: createUserVerificationComponentPageObject(testArgs),
    waitlist: createWaitlistComponentPageObject(testArgs),
    apiKeys: createAPIKeysComponentPageObject(testArgs),
    subscriptionDetails: createSubscriptionDetailsPageObject(testArgs),
    planDetails: createPlanDetailsPageObject(testArgs),
  };
};
