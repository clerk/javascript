/// <reference types="cypress" />
import type { Clerk, SignOutOptions } from '@clerk/shared/types';

import type { ClerkSignInParams } from '../common';
import { signInHelper } from '../common';
import { setupClerkTestingToken } from './setupClerkTestingToken';

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
       *  it("sign in", () => {
       *     cy.visit(`/`);
       *     cy.clerkSignIn({ strategy: 'phone_code', identifier: '+15555550100' });
       *     cy.visit('/protected');
       *  });
       */
      clerkSignIn(signInParams: ClerkSignInParams): Chainable<void>;

      /**
       * Signs out the current user using Clerk.
       * It is required to call `cy.visit` before calling this command, and navigate to a page that loads Clerk.
       * @param signOutOptions - A SignOutOptions object.
       *
       * @example
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
    cy.log(`Clerk: Signing in...`);

    cy.window()
      .should(window => {
        expect(window).to.not.have.property(`Clerk`, undefined);
        expect(window.Clerk.loaded).to.eq(true);
      })
      .then(async window => {
        await signInHelper({ windowObject: window, signInParams });
        cy.log(`Clerk: Finished signing in.`);
      });
  });

  Cypress.Commands.add(`clerkSignOut`, signOutOptions => {
    cy.log(`Clerk: Signing out...`);

    cy.window()
      .should(window => {
        expect(window).to.not.have.property(`Clerk`, undefined);
        expect(window.Clerk.loaded).to.eq(true);
      })
      .then(async window => {
        await window.Clerk.signOut(signOutOptions);
        cy.log(`Clerk: Finished signing out.`);
      });
  });

  Cypress.Commands.add(`clerkLoaded`, () => {
    cy.window().should(window => {
      expect(window).to.not.have.property(`Clerk`, undefined);
      expect(window.Clerk.loaded).to.eq(true);
    });
  });
};
