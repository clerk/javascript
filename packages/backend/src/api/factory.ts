import {
  AllowlistIdentifierAPI,
  ClientAPI,
  DomainAPI,
  EmailAddressAPI,
  EmailAPI,
  InterstitialAPI,
  InvitationAPI,
  OrganizationAPI,
  OrganizationPermissionAPI,
  OrganizationRoleAPI,
  PhoneNumberAPI,
  RedirectUrlAPI,
  SessionAPI,
  SignInTokenAPI,
  SMSMessageAPI,
  UserAPI,
} from './endpoints';
import { buildRequest } from './request';

export type CreateBackendApiOptions = {
  /**
   * Backend API key
   * @deprecated Use `secretKey` instead.
   */
  apiKey?: string;
  /* Secret Key */
  secretKey?: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  userAgent?: string;
  /**
   * @deprecated This option has been deprecated and will be removed with the next major release.
   * A RequestInit init object used by the `request` method.
   */
  httpOptions?: RequestInit;
};

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
    organizationRoles: new OrganizationRoleAPI(request),
    organizationPermissions: new OrganizationPermissionAPI(request),
    phoneNumbers: new PhoneNumberAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    smsMessages: new SMSMessageAPI(request),
    users: new UserAPI(request),
    domains: new DomainAPI(request),
  };
}
