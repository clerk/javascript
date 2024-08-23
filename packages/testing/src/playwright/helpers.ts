import type { Clerk, EmailCodeFactor, PhoneCodeFactor, SignInFirstFactor, SignOutOptions } from '@clerk/types';
import type { Page } from '@playwright/test';

import type { ClerkSignInParams, SetupClerkTestingTokenOptions } from '../common';
import { CLERK_TEST_CODE } from '../common';
import { setupClerkTestingToken } from './setupClerkTestingToken';

declare global {
  interface Window {
    Clerk: Clerk;
  }
}

type PlaywrightClerkLoadedParams = {
  page: Page;
};

const loaded = async ({ page }: PlaywrightClerkLoadedParams) => {
  await page.waitForFunction(() => window.Clerk !== undefined);
  await page.waitForFunction(() => window.Clerk.loaded);
};

type PlaywrightClerkSignInParams = {
  page: Page;
  signInParams: ClerkSignInParams;
  setupClerkTestingTokenOptions?: SetupClerkTestingTokenOptions;
};

const signIn = async ({ page, signInParams, setupClerkTestingTokenOptions }: PlaywrightClerkSignInParams) => {
  await setupClerkTestingToken({ page, options: setupClerkTestingTokenOptions });
  await loaded({ page });

  await page.evaluate(
    async ({ signInParams }) => {
      try {
        if (!window.Clerk.client) {
          return;
        }
        const signIn = window.Clerk.client.signIn;
        if (signInParams.strategy === 'password') {
          const res = await signIn.create(signInParams);
          await window.Clerk.setActive({
            session: res.createdSessionId,
          });
        } else {
          // assertIdentifierRequirement
          if (signInParams.strategy === 'phone_code' && !signInParams.identifier.includes('+155555501')) {
            throw new Error(
              `Phone number should be a test phone number.\n
       Example: +15555550100.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#phone-numbers`,
            );
          }
          if (signInParams.strategy === 'email_code' && !signInParams.identifier.includes('+clerk_test')) {
            throw new Error(
              `Email should be a test email.\n
       Any email with the +clerk_test subaddress is a test email address.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#email-addresses`,
            );
          }

          // signInWithCode
          const { supportedFirstFactors } = await signIn.create({
            identifier: signInParams.identifier,
          });
          const codeFactorFn =
            signInParams.strategy === 'phone_code'
              ? (factor: SignInFirstFactor): factor is PhoneCodeFactor => factor.strategy === 'phone_code'
              : (factor: SignInFirstFactor): factor is EmailCodeFactor => factor.strategy === 'email_code';
          const codeFactor = supportedFirstFactors?.find(codeFactorFn);
          if (codeFactor) {
            const prepareParams =
              signInParams.strategy === 'phone_code'
                ? { strategy: signInParams.strategy, phoneNumberId: (codeFactor as PhoneCodeFactor).phoneNumberId }
                : { strategy: signInParams.strategy, emailAddressId: (codeFactor as EmailCodeFactor).emailAddressId };

            await signIn.prepareFirstFactor(prepareParams);
            const signInAttempt = await signIn.attemptFirstFactor({
              strategy: signInParams.strategy,
              code: CLERK_TEST_CODE,
            });

            if (signInAttempt.status === 'complete') {
              await window.Clerk.setActive({ session: signInAttempt.createdSessionId });
            } else {
              throw new Error(`Status is ${signInAttempt.status}`);
            }
          } else {
            throw new Error(`${signInParams.strategy} is not enabled.`);
          }
        }
      } catch (err: any) {
        throw new Error(`Clerk: Failed to sign in: ${err?.message}`);
      }
    },
    { signInParams },
  );
};

type PlaywrightClerkSignOutParams = {
  page: Page;
  signOutOptions?: SignOutOptions;
};

const signOut = async ({ page, signOutOptions }: PlaywrightClerkSignOutParams) => {
  await loaded({ page });

  await page.evaluate(async options => {
    await window.Clerk.signOut(options);
  }, signOutOptions);
};

export const clerk = {
  signIn,
  signOut,
  loaded,
};
