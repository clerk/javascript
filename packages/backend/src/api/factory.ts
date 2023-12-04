import {
  AllowlistIdentifierAPI,
  ClientAPI,
  DomainAPI,
  EmailAddressAPI,
  EmailAPI,
  InterstitialAPI,
  InvitationAPI,
  OrganizationAPI,
  PhoneNumberAPI,
  RedirectUrlAPI,
  SessionAPI,
  SignInTokenAPI,
  UserAPI,
} from './endpoints';
import { buildRequest } from './request';

export type CreateBackendApiOptions = Parameters<typeof buildRequest>[0];

export type ApiClient = ReturnType<typeof createBackendApiClient>;

export function createBackendApiClient(options: CreateBackendApiOptions) {
  const request = buildRequest(options);

  return {
    allowlistIdentifiers: new AllowlistIdentifierAPI(request),
    clients: new ClientAPI(request),
    emailAddresses: new EmailAddressAPI(request),
    emails: new EmailAPI(request),
    interstitial: new InterstitialAPI(request),
    invitations: new InvitationAPI(request),
    organizations: new OrganizationAPI(request),
    phoneNumbers: new PhoneNumberAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    users: new UserAPI(request),
    domains: new DomainAPI(request),
  };
}
