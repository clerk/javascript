import type { Page } from '@playwright/test';

import { createAppPageObject } from './app';
import { createClerkPageObject } from './clerk';
import { createExpectPageObject } from './expect';
import { createKeylessPopoverPageObject } from './keylessPopover';
import { createOrganizationSwitcherComponentPageObject } from './organizationSwitcher';
import { createSessionTaskComponentPageObject } from './sessionTask';
import { createSignInComponentPageObject } from './signIn';
import { createSignUpComponentPageObject } from './signUp';
import { createTestingTokenPageObject } from './testingToken';
import { createUserButtonPageObject } from './userButton';
import { createUserProfileComponentPageObject } from './userProfile';
import { createUserVerificationComponentPageObject } from './userVerification';
import { createWaitlistComponentPageObject } from './waitlist';

export const createPageObjects = (
  page: Page,
  { useTestingToken, serverUrl }: { useTestingToken?: boolean; serverUrl: string },
) => {
  const app = createAppPageObject({ page, useTestingToken }, { serverUrl });
  const testArgs = { page: app };

  return {
    app,
    clerk: createClerkPageObject(testArgs),
    expect: createExpectPageObject(testArgs),
    keylessPopover: createKeylessPopoverPageObject(testArgs),
    organizationSwitcher: createOrganizationSwitcherComponentPageObject(testArgs),
    sessionTask: createSessionTaskComponentPageObject(testArgs),
    signIn: createSignInComponentPageObject(testArgs),
    signUp: createSignUpComponentPageObject(testArgs),
    testingToken: createTestingTokenPageObject(testArgs),
    userButton: createUserButtonPageObject(testArgs),
    userProfile: createUserProfileComponentPageObject(testArgs),
    userVerification: createUserVerificationComponentPageObject(testArgs),
    waitlist: createWaitlistComponentPageObject(testArgs),
  };
};
