/// <reference types="cypress" />
import { type CreateAgentTaskParams, createAgentTaskUrl as _createAgentTaskUrl } from '../common';

/**
 * Creates an agent task using the Clerk Backend API and returns its URL.
 *
 * If `secretKey` is not provided, falls back to the `CLERK_SECRET_KEY` Cypress environment variable.
 *
 * @experimental This is an experimental API for the Agent Tasks feature that is available under a private beta,
 * and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version
 * and the clerk-js version to avoid breaking changes.
 */
export function createAgentTaskUrl(params: CreateAgentTaskParams) {
  return _createAgentTaskUrl({
    ...params,
    secretKey: params.secretKey || Cypress.env('CLERK_SECRET_KEY') || process.env.CLERK_SECRET_KEY,
  });
}
