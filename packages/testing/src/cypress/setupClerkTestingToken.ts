/// <reference types="cypress" />
import type { SetupClerkTestingTokenOptions } from '../common';
import { ERROR_MISSING_FRONTEND_API_URL, TESTING_TOKEN_PARAM } from '../common';

type SetupClerkTestingTokenParams = {
  options?: SetupClerkTestingTokenOptions;
};

/**
 * Bypasses bot protection by appending the testing token in the Frontend API requests.
 *
 * @param params.options.frontendApiUrl - The frontend API URL for your Clerk dev instance, without the protocol.
 * @returns A promise that resolves when the bot protection bypass is set up.
 * @throws An error if the Frontend API URL is not provided.
 * @example
 * import { setupClerkTestingToken } from '@clerk/testing/cypress';
 *
 * it("sign up", () => {
 *     setupClerkTestingToken();
 *     cy.visit("http://localhost:3000");
 *     // Continue with your test...
 * });
 */
export const setupClerkTestingToken = (params?: SetupClerkTestingTokenParams) => {
  const fapiUrl = params?.options?.frontendApiUrl || Cypress.env('CLERK_FAPI');
  if (!fapiUrl) {
    throw new Error(ERROR_MISSING_FRONTEND_API_URL);
  }
  const apiUrl = `https://${fapiUrl}/v1/**`;

  cy.intercept(apiUrl, req => {
    const testingToken = Cypress.env('CLERK_TESTING_TOKEN');
    if (testingToken) {
      req.query[TESTING_TOKEN_PARAM] = testingToken;
    }

    req.continue();

    req.on('response', res => {
      // Override captcha_bypass in /v1/client
      if (res.body?.response?.captcha_bypass === false) {
        res.body.response.captcha_bypass = true;
      }

      // Override captcha_bypass in piggybacking
      if (res.body?.client?.captcha_bypass === false) {
        res.body.client.captcha_bypass = true;
      }
    });
  });
};
