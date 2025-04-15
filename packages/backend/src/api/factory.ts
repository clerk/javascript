import {
  AccountlessApplicationAPI,
  ActorTokenAPI,
  AllowlistIdentifierAPI,
  BlocklistIdentifierAPI,
  ClientAPI,
  DomainAPI,
  EmailAddressAPI,
  InvitationAPI,
  JwksAPI,
  JwtTemplatesApi,
  OAuthApplicationsApi,
  OrganizationAPI,
  PhoneNumberAPI,
  ProxyCheckAPI,
  RedirectUrlAPI,
  SamlConnectionAPI,
  SessionAPI,
  SignInTokenAPI,
  TestingTokenAPI,
  UserAPI,
  WebhookAPI,
} from './endpoints';
import { buildRequest } from './request';

export type CreateBackendApiOptions = Parameters<typeof buildRequest>[0];

export type ApiClient = ReturnType<typeof createBackendApiClient>;

export function createBackendApiClient(options: CreateBackendApiOptions) {
  const request = buildRequest(options);

  return {
    __experimental_accountlessApplications: new AccountlessApplicationAPI(
      buildRequest({ ...options, requireSecretKey: false }),
    ),
    actorTokens: new ActorTokenAPI(request),
    allowlistIdentifiers: new AllowlistIdentifierAPI(request),
    blocklistIdentifiers: new BlocklistIdentifierAPI(request),
    clients: new ClientAPI(request),
    domains: new DomainAPI(request),
    emailAddresses: new EmailAddressAPI(request),
    invitations: new InvitationAPI(request),
    jwks: new JwksAPI(request),
    jwtTemplates: new JwtTemplatesApi(request),
    oauthApplications: new OAuthApplicationsApi(request),
    organizations: new OrganizationAPI(request),
    phoneNumbers: new PhoneNumberAPI(request),
    proxyChecks: new ProxyCheckAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    samlConnections: new SamlConnectionAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    testingTokens: new TestingTokenAPI(request),
    users: new UserAPI(request),
    webhooks: new WebhookAPI(request),
  };
}
