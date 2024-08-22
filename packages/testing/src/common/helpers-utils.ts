import type { EmailCodeFactor, PhoneCodeFactor, SignInFirstFactor, SignInResource } from '@clerk/types';

import { CLERK_TEST_CODE } from './constants';
import type { ClerkSignInParams } from './types';

export const signInHelper = async (window: Window, signInParams: ClerkSignInParams) => {
  if (!window.Clerk.client) {
    return;
  }
  const signIn = window.Clerk.client.signIn;
  try {
    if (signInParams.strategy === 'password') {
      const res = await signIn.create(signInParams);
      await window.Clerk.setActive({
        session: res.createdSessionId,
      });
    } else {
      assertIdentifierRequirement(signInParams.identifier, signInParams.strategy);
      await signInWithCode(signIn, window.Clerk.setActive, signInParams.identifier, signInParams.strategy);
    }
  } catch (err: any) {
    throw new Error(`Clerk: Failed to sign in: ${err?.message}`);
  }
};

const signInWithCode = async (
  signIn: SignInResource,
  setActive: any,
  identifier: string,
  strategy: 'phone_code' | 'email_code',
) => {
  const { supportedFirstFactors } = await signIn.create({
    identifier,
  });
  const codeFactorFn = strategy === 'phone_code' ? isPhoneCodeFactor : isEmailCodeFactor;
  const codeFactor = supportedFirstFactors?.find(codeFactorFn);
  if (codeFactor) {
    const prepareParams =
      strategy === 'phone_code'
        ? { strategy, phoneNumberId: (codeFactor as PhoneCodeFactor).phoneNumberId }
        : { strategy, emailAddressId: (codeFactor as EmailCodeFactor).emailAddressId };

    await signIn.prepareFirstFactor(prepareParams);
    const signInAttempt = await signIn.attemptFirstFactor({
      strategy,
      code: CLERK_TEST_CODE,
    });

    if (signInAttempt.status === 'complete') {
      await setActive({ session: signInAttempt.createdSessionId });
    } else {
      throw new Error(`Status is ${signInAttempt.status}`);
    }
  } else {
    throw new Error(`${strategy} is not enabled.`);
  }
};

const assertIdentifierRequirement = (identifier: string, strategy: string) => {
  if (strategy === 'phone_code' && !identifier.includes('+155555501')) {
    throw new Error(
      `Phone number should be a test phone number.\n
       Example: +15555550100.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#phone-numbers`,
    );
  }
  if (strategy === 'email_code' && !identifier.includes('+clerk_test')) {
    throw new Error(
      `Email should be a test email.\n
       Any email with the +clerk_test subaddress is a test email address.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#email-addresses`,
    );
  }
};

const isPhoneCodeFactor = (factor: SignInFirstFactor): factor is PhoneCodeFactor => {
  return factor.strategy === 'phone_code';
};

const isEmailCodeFactor = (factor: SignInFirstFactor): factor is EmailCodeFactor => {
  return factor.strategy === 'email_code';
};
