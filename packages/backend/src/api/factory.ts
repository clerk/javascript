import { API_KEY, API_URL, API_VERSION, USER_AGENT } from '../constants';
import {
  AllowlistIdentifierAPI,
  ClientAPI,
  EmailAPI,
  InterstitialAPI,
  InvitationAPI,
  OrganizationAPI,
  RedirectUrlAPI,
  SessionAPI,
  SignInTokenAPI,
  SMSMessageAPI,
  UserAPI,
} from './endpoints';
import { buildRequest } from './request';

export type ClerkBackendAPIOptions = {
  /* Backend API key */
  apiKey?: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  userAgent?: string;
};

export function createBackendApiClient(options?: ClerkBackendAPIOptions) {
  const { apiKey = API_KEY, apiUrl = API_URL, apiVersion = API_VERSION, userAgent = USER_AGENT } = options || {};

  const request = buildRequest({ apiKey, apiUrl, apiVersion, userAgent });

  return {
    allowlistIdentifiers: new AllowlistIdentifierAPI(request),
    clients: new ClientAPI(request),
    emails: new EmailAPI(request),
    interstitial: new InterstitialAPI(request),
    invitations: new InvitationAPI(request),
    organizations: new OrganizationAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    smsMessage: new SMSMessageAPI(request),
    users: new UserAPI(request),
  };
}
