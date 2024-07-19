/// <reference types="cypress" />
import type {
  Clerk,
  EmailCodeFactor,
  PhoneCodeFactor,
  SignInFirstFactor,
  SignInResource,
  SignOutOptions,
} from '@clerk/types';

import { setupClerkTestingToken } from './setupClerkTestingToken';

const CLERK_TEST_CODE = '424242';

type CypressClerkSignInParams =
  | {
      strategy: 'password';
      password: string;
      identifier: string;
    }
  | {
      strategy: 'phone_code' | 'email_code';
      identifier: string;
    };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Signs in a user using Clerk. This custom command supports only password, phone_code and email_code first factor strategies.
       * Multi-factor is not supported.
       * This helper is using the `setupClerkTestingToken` internally.
       * It is required to call `cy.visit` before calling this command, and navigate to a not protected page that loads Clerk.
       *
       * If the strategy is password, the command will sign in the user using the provided password and identifier.
       * If the strategy is phone_code, you are required to have a user with a test phone number as an identifier (e.g. +15555550100).
       * If the strategy is email_code, you are required to have a user with a test email as an identifier (e.g. your_email+clerk_test@example.com).
       *
       * @param signInParams - The sign in parameters.
       * @param signInParams.strategy - The sign in strategy. Supported strategies are 'password', 'phone_code' and 'email_code'.
       * @param signInParams.identifier - The user's identifier. Could be a username, a phone number or an email.
       * @param signInParams.password - The user's password. Required only if the strategy is 'password'.
       *
       * @example
       * ```ts
       *  it("sign in", () => {
       *     cy.visit(`/`);
       *     cy.clerkSignIn({ strategy: 'phone_code', identifier: '+15555550100' });
       *     cy.visit('/protected');
       *  });
       */
      clerkSignIn(signInParams: CypressClerkSignInParams): Chainable<void>;

      /**
       * Signs out the current user using Clerk.
       * It is required to call `cy.visit` before calling this command, and navigate to a page that loads Clerk.
       * @param signOutOptions - A SignOutOptions object.
       *
       * @example
       * ```ts
       *  it("sign out", () => {
       *     cy.visit(`/`);
       *     cy.clerkSignIn({ strategy: 'phone_code', identifier: '+15555550100' });
       *     cy.visit('/protected');
       *     cy.clerkSignOut();
       *  });
       */
      clerkSignOut(signOutOptions?: SignOutOptions): Chainable<void>;

      /**
       * Asserts that Clerk has been loaded.
       * It is required to call `cy.visit` before calling this command, and navigate to a page that loads Clerk.
       */
      clerkLoaded(): Chainable<void>;
    }
  }
  interface Window {
    Clerk: Clerk;
  }
}

type AddClerkCommandsParams = {
  Cypress: typeof Cypress;
  cy: Cypress.Chainable;
};

export const addClerkCommands = ({ Cypress, cy }: AddClerkCommandsParams) => {
  Cypress.Commands.add(`clerkSignIn`, signInParams => {
    setupClerkTestingToken();
    cy.log(`Signing in.`);

    cy.window()
      .should(window => {
        expect(window).to.not.have.property(`Clerk`, undefined);
        expect(window.Clerk.loaded).to.eq(true);
      })
      .then(async window => {
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
          cy.log(`Clerk: Failed to sign in: ${err?.message}`);
          throw new Error(`Clerk: Failed to sign in: ${err?.message}`);
        }

        cy.log(`Finished signing in.`);
      });
  });

  Cypress.Commands.add(`clerkSignOut`, signOutOptions => {
    cy.log(`Signing out.`);

    cy.window()
      .should(window => {
        expect(window).to.not.have.property(`Clerk`, undefined);
        expect(window.Clerk.loaded).to.eq(true);
      })
      .then(async window => {
        await window.Clerk.signOut(signOutOptions);

        cy.log(`Finished signing out.`);
      });
  });

  Cypress.Commands.add(`clerkLoaded`, () => {
    cy.window().should(window => {
      expect(window).to.not.have.property(`Clerk`, undefined);
      expect(window.Clerk.loaded).to.eq(true);
    });
  });
};

const isPhoneCodeFactor = (factor: SignInFirstFactor): factor is PhoneCodeFactor => {
  return factor.strategy === 'phone_code';
};

const isEmailCodeFactor = (factor: SignInFirstFactor): factor is EmailCodeFactor => {
  return factor.strategy === 'email_code';
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
      throw new Error(`Failed to sign in. Status is ${signInAttempt.status}`);
    }
  } else {
    throw new Error(`${strategy} is not enabled.`);
  }
};

const assertIdentifierRequirement = (identifier: string, strategy: string) => {
  if (strategy === 'phone_code' && !identifier.includes('+155555501')) {
    throw new Error(
      `Clerk: Phone number should be a test phone number.\n
       Example: +15555550100.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#phone-numbers`,
    );
  }
  if (strategy === 'email_code' && !identifier.includes('+clerk_test')) {
    throw new Error(
      `Clerk: Email should be a test email.\n
       Any email with the +clerk_test subaddress is a test email address.\n
       Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#email-addresses`,
    );
  }
};
