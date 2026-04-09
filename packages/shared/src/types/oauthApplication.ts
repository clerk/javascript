import type { ClerkResourceJSON } from './json';

/**
 * @internal
 */
export type OAuthConsentScopeJSON = {
  scope: string;
  description: string | null;
  requires_consent: boolean;
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

/**
 * A single OAuth scope with its description and whether it requires consent.
 */
export type OAuthConsentScope = {
  scope: string;
  description: string | null;
  requiresConsent: boolean;
};

/**
 * OAuth consent screen metadata from `GET /v1/me/oauth/consent/{oauthClientId}`.
 * Includes information needed to populate the consent dialog.
 */
export type OAuthConsentInfo = {
  oauthApplicationName: string;
  oauthApplicationLogoUrl: string;
  oauthApplicationUrl: string;
  clientId: string;
  state: string;
  scopes: OAuthConsentScope[];
};

export type FetchOAuthConsentInfoParams = {
  /** OAuth `client_id` from the authorize request. */
  oauthClientId: string;
  /** Optional space-delimited scope string from the authorize request. */
  scope?: string;
};

/**
 * Namespace exposed on `Clerk` for OAuth application / consent helpers.
 */
export interface OAuthApplicationNamespace {
  /**
   * Loads consent metadata for the given OAuth client for the signed-in user.
   */
  fetchConsentInfo: (params: FetchOAuthConsentInfoParams) => Promise<OAuthConsentInfo>;
}
