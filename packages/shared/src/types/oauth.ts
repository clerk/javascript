import type { OAuthStrategy } from './strategies';

export type OAuthScope = string;

/**
 * A single OAuth scope returned by the Frontend API for the consent screen.
 */
export type OAuthConsentScope = {
  scope: string;
  description: string | null;
  requires_consent: boolean;
};

/**
 * OAuth application metadata and requested scopes for the authorization consent step.
 * Shape matches `GET /v1/me/oauth/consent/{oauth_client_id}`.
 */
export type OAuthConsentInfo = {
  oauth_application_name: string;
  oauth_application_logo_url?: string;
  oauth_application_url?: string;
  client_id: string;
  state: string;
  scopes: OAuthConsentScope[];
};

/**
 * Parameters for `Clerk.fetchOAuthConsentInfo`.
 */
export type FetchOAuthConsentInfoParams = {
  /**
   * OAuth 2.0 `client_id` from the authorize request.
   */
  oauthClientId: string;
  /**
   * Space-delimited OAuth scopes from the authorize request, if any.
   */
  scope?: string;
};

export interface OAuthProviderData {
  provider: OAuthProvider;
  strategy: OAuthStrategy;
  name: string;
  docsUrl: string;
}

export type FacebookOauthProvider = 'facebook';
export type GoogleOauthProvider = 'google';
export type HubspotOauthProvider = 'hubspot';
export type GithubOauthProvider = 'github';
export type TiktokOauthProvider = 'tiktok';
export type GitlabOauthProvider = 'gitlab';
export type DiscordOauthProvider = 'discord';
export type TwitterOauthProvider = 'twitter';
export type TwitchOauthProvider = 'twitch';
export type LinkedinOauthProvider = 'linkedin';
export type LinkedinOIDCOauthProvider = 'linkedin_oidc';
export type DropboxOauthProvider = 'dropbox';
export type AtlassianOauthProvider = 'atlassian';
export type BitbucketOauthProvider = 'bitbucket';
export type MicrosoftOauthProvider = 'microsoft';
export type NotionOauthProvider = 'notion';
export type AppleOauthProvider = 'apple';
export type LineOauthProvider = 'line';
export type InstagramOauthProvider = 'instagram';
export type CoinbaseOauthProvider = 'coinbase';
export type SpotifyOauthProvider = 'spotify';
export type XeroOauthProvider = 'xero';
export type BoxOauthProvider = 'box';
export type SlackOauthProvider = 'slack';
export type LinearOauthProvider = 'linear';
export type XOauthProvider = 'x';
export type EnstallOauthProvider = 'enstall';
export type HuggingfaceOAuthProvider = 'huggingface';
export type VercelOauthProvider = 'vercel';
export type CustomOauthProvider = `custom_${string}`;

export type OAuthProvider =
  | FacebookOauthProvider
  | GoogleOauthProvider
  | HubspotOauthProvider
  | GithubOauthProvider
  | TiktokOauthProvider
  | GitlabOauthProvider
  | DiscordOauthProvider
  | TwitterOauthProvider
  | TwitchOauthProvider
  | LinkedinOauthProvider
  | LinkedinOIDCOauthProvider
  | DropboxOauthProvider
  | AtlassianOauthProvider
  | BitbucketOauthProvider
  | MicrosoftOauthProvider
  | NotionOauthProvider
  | AppleOauthProvider
  | LineOauthProvider
  | InstagramOauthProvider
  | CoinbaseOauthProvider
  | SpotifyOauthProvider
  | XeroOauthProvider
  | BoxOauthProvider
  | SlackOauthProvider
  | LinearOauthProvider
  | XOauthProvider
  | EnstallOauthProvider
  | HuggingfaceOAuthProvider
  | VercelOauthProvider
  | CustomOauthProvider;
