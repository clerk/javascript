import { API_URL, API_VERSION, USER_AGENT } from '../constants';
import {
  AllowlistIdentifierAPI,
  ClientAPI,
  EmailAddressAPI,
  EmailAPI,
  InterstitialAPI,
  InvitationAPI,
  OrganizationAPI,
  PhoneNumberAPI,
  RedirectUrlAPI,
  SessionAPI,
  SignInTokenAPI,
  SMSMessageAPI,
  UserAPI,
} from './endpoints';
import { buildRequest } from './request';

export type CreateBackendApiOptions = {
  /* Backend API key */
  apiKey: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  userAgent?: string;
};

export type ApiClient = ReturnType<typeof createBackendApiClient>;

export function createBackendApiClient(options: CreateBackendApiOptions) {
  const { apiKey, apiUrl = API_URL, apiVersion = API_VERSION, userAgent = USER_AGENT } = options;

  const request = buildRequest({
    apiKey,
    apiUrl,
    apiVersion,
    userAgent,
  });

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
    smsMessages: new SMSMessageAPI(request),
    users: new UserAPI(request),
  };
}
