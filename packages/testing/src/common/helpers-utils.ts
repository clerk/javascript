import type { EmailCodeFactor, PhoneCodeFactor, SignInFirstFactor } from '@clerk/shared/types';

import type { SignInHelperParams } from './types';

// This function is serialized and executed in the browser context
export const signInHelper = async ({ signInParams, windowObject }: SignInHelperParams) => {
  try {
    const w = windowObject || window;
    if (!w.Clerk.client) {
      return;
    }

    const signIn = w.Clerk.client.signIn;

    switch (signInParams.strategy) {
      case 'password': {
        const res = await signIn.create(signInParams);
        await w.Clerk.setSelected({
          session: res.createdSessionId,
        });
        break;
      }

      case 'ticket': {
        const res = await signIn.create({
          strategy: 'ticket',
          ticket: signInParams.ticket,
        });

        if (res.status === 'complete') {
          await w.Clerk.setSelected({
            session: res.createdSessionId,
          });
        } else {
          throw new Error(`Sign-in with ticket failed. Status: ${res.status}`);
        }
        break;
      }

      case 'phone_code': {
        // Assert that the identifier is a test phone number
        if (!/^\+1\d{3}55501\d{2}$/.test(signInParams.identifier)) {
          throw new Error(
            `Phone number should be a test phone number.\n
       Example: +1XXX55501XX.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#phone-numbers`,
          );
        }

        // Sign in with phone code
        const { supportedFirstFactors } = await signIn.create({
          identifier: signInParams.identifier,
        });
        const phoneFactor = supportedFirstFactors?.find(
          (factor: SignInFirstFactor): factor is PhoneCodeFactor => factor.strategy === 'phone_code',
        );

        if (phoneFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: phoneFactor.phoneNumberId,
          });
          const signInAttempt = await signIn.attemptFirstFactor({
            strategy: 'phone_code',
            code: '424242',
          });

          if (signInAttempt.status === 'complete') {
            await w.Clerk.setSelected({ session: signInAttempt.createdSessionId });
          } else {
            throw new Error(`Status is ${signInAttempt.status}`);
          }
        } else {
          throw new Error('phone_code is not enabled.');
        }
        break;
      }

      case 'email_code': {
        // Assert that the identifier is a test email
        if (!signInParams.identifier.includes('+clerk_test')) {
          throw new Error(
            `Email should be a test email.\n
       Any email with the +clerk_test subaddress is a test email address.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#email-addresses`,
          );
        }

        // Sign in with email code
        const { supportedFirstFactors } = await signIn.create({
          identifier: signInParams.identifier,
        });
        const emailFactor = supportedFirstFactors?.find(
          (factor: SignInFirstFactor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        );

        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
          const signInAttempt = await signIn.attemptFirstFactor({
            strategy: 'email_code',
            code: '424242',
          });

          if (signInAttempt.status === 'complete') {
            await w.Clerk.setSelected({ session: signInAttempt.createdSessionId });
          } else {
            throw new Error(`Status is ${signInAttempt.status}`);
          }
        } else {
          throw new Error('email_code is not enabled.');
        }
        break;
      }

      default:
        throw new Error(`Unsupported strategy: ${(signInParams as any).strategy}`);
    }
  } catch (err: any) {
    throw new Error(`Clerk: Failed to sign in: ${err?.message}`);
  }
};
