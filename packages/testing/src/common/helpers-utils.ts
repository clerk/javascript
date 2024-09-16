import type { EmailCodeFactor, PhoneCodeFactor, SignInFirstFactor } from '@clerk/types';

import type { SignInHelperParams } from './types';

// This function is serialized and executed in the browser context
export const signInHelper = async ({ signInParams, windowObject }: SignInHelperParams) => {
  try {
    const w = windowObject || window;
    if (!w.Clerk.client) {
      return;
    }
    const signIn = w.Clerk.client.signIn;
    if (signInParams.strategy === 'password') {
      const res = await signIn.create(signInParams);
      await w.Clerk.setActive({
        session: res.createdSessionId,
      });
    } else {
      // Assert that the identifier is a test email or phone number
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

      // Sign in with code (email_code or phone_code)
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
          code: '424242',
        });

        if (signInAttempt.status === 'complete') {
          await w.Clerk.setActive({ session: signInAttempt.createdSessionId });
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
};
