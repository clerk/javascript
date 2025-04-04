import { ClerkBackendApi } from '@clerk/backend-api-client';
import { joinPaths } from 'src/util/path';

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
export type BackendApiClient = ReturnType<typeof createGeneratedBackendApiClient>;

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

export function createGeneratedBackendApiClient(options: CreateBackendApiOptions) {
  const serverURL = options.apiUrl ? joinPaths(options.apiUrl, options.apiVersion || 'v1') : undefined;

  // TODO: Add dynamic user agent
  return new ClerkBackendApi({
    bearerAuth: options.secretKey,
    serverURL,
  });
}
