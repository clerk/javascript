import { Clerk as ApiNext } from '@clerk/backend-sdk';

import { joinPaths } from '../util/path';
import {
  AccountlessApplicationAPI,
  AllowlistIdentifierAPI,
  ClientAPI,
  DomainAPI,
  EmailAddressAPI,
  InvitationAPI,
  OrganizationAPI,
  PhoneNumberAPI,
  RedirectUrlAPI,
  SamlConnectionAPI,
  SessionAPI,
  SignInTokenAPI,
  TestingTokenAPI,
  UserAPI,
} from './endpoints';
import { buildRequest } from './request';

export type CreateBackendApiOptions = Parameters<typeof buildRequest>[0];

export type ApiClient = ReturnType<typeof createBackendApiClient>;
export type ExperimentalApiClient = ReturnType<typeof createExperimentalBackendApiClient>;

export function createBackendApiClient(options: CreateBackendApiOptions) {
  const request = buildRequest(options);

  return {
    __experimental_accountlessApplications: new AccountlessApplicationAPI(
      buildRequest({ ...options, requireSecretKey: false }),
    ),
    allowlistIdentifiers: new AllowlistIdentifierAPI(request),
    clients: new ClientAPI(request),
    emailAddresses: new EmailAddressAPI(request),
    invitations: new InvitationAPI(request),
    organizations: new OrganizationAPI(request),
    phoneNumbers: new PhoneNumberAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    users: new UserAPI(request),
    domains: new DomainAPI(request),
    samlConnections: new SamlConnectionAPI(request),
    testingTokens: new TestingTokenAPI(request),
  };
}

export type ExperimentalBackendApiClient = ExperimentalApiClient; // TODO: remove this and replace instances

export function createExperimentalBackendApiClient(options: CreateBackendApiOptions) {
  const serverURL = options.apiUrl ? joinPaths(options.apiUrl, options.apiVersion) : undefined;

  const api = new ApiNext({
    bearerAuth: options.secretKey,
    serverURL,
    // userAgent: options.userAgent,
  });

  return api;
}
