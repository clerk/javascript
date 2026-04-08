import type { ClerkResourceJSON } from './json';

/**
 * A single OAuth scope row returned by the Frontend API consent metadata endpoint.
 */
export type OAuthConsentScopeJSON = {
  scope: string;
  description: string | null;
  requires_consent: boolean;
};

/**
 * OAuth consent screen metadata from `GET /v1/me/oauth/consent/{oauthClientId}`.
 * Field names match the Frontend API JSON (snake_case).
 */
export type OAuthConsentInfo = {
  oauth_application_name: string;
  oauth_application_logo_url: string;
  oauth_application_url: string;
  client_id: string;
  state: string;
  scopes: OAuthConsentScopeJSON[];
};

/**
 * @internal
 */
export interface OAuthConsentInfoJSON extends ClerkResourceJSON {
  object: 'oauth_consent_info';
  oauth_application_name: string;
  oauth_application_logo_url: string;
  oauth_application_url: string;
  client_id: string;
  state: string;
  scopes: OAuthConsentScopeJSON[];
}

export type FetchOAuthConsentInfoParams = {
  /** OAuth `client_id` from the authorize request. */
  oauthClientId: string;
  /** Optional normalized scope string (e.g. space-delimited). */
  scope?: string;
};

/**
 * Namespace exposed on `Clerk` for OAuth application / consent helpers.
 */
export interface OAuthApplicationNamespace {
  /**
   * Loads consent metadata for the given OAuth client for the signed-in user.
   * Uses the Frontend API session (cookies, `_clerk_session_id`, dev browser, etc.) like other `/me` requests.
   */
  fetchConsentInfo: (params: FetchOAuthConsentInfoParams) => Promise<OAuthConsentInfo>;
}
