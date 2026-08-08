import type { Page } from '@playwright/test';

import type { PlaywrightSetupClerkTestingTokenOptions } from '../../setupClerkTestingToken';
import { createAPIKeysComponentPageObject } from './apiKeys';
import { createAppPageObject } from './app';
import { createCheckoutPageObject } from './checkout';
import { createClerkPageObject } from './clerk';
import { createExpectPageObject } from './expect';
import { createImpersonationPageObject } from './impersonation';
import { createKeylessPopoverPageObject } from './keylessPopover';
import { createOrganizationProfileComponentPageObject } from './organizationProfile';
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
  testingTokenOptions,
}: {
  page: Page;
  useTestingToken?: boolean;
  baseURL?: string;
  testingTokenOptions?: PlaywrightSetupClerkTestingTokenOptions;
}) => {
  const app = createAppPageObject({ page, useTestingToken, testingTokenOptions }, { baseURL });
  const testArgs = { page: app, testingTokenOptions };

  return {
    page: app,
    clerk: createClerkPageObject(testArgs),
    checkout: createCheckoutPageObject(testArgs),
    expect: createExpectPageObject(testArgs),
    impersonation: createImpersonationPageObject(testArgs),
    keylessPopover: createKeylessPopoverPageObject(testArgs),
    organizationProfile: createOrganizationProfileComponentPageObject(testArgs),
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
