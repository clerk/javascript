import type { OAuthStrategy } from './strategies';

export type OAuthScope = string;

export interface OAuthProviderData {
  provider: OAuthProvider;
  strategy: OAuthStrategy;
  name: string;
  docsUrl: string;
}

/** @inline */
export type FacebookOauthProvider = 'facebook';
/** @inline */
export type GoogleOauthProvider = 'google';
/** @inline */
export type HubspotOauthProvider = 'hubspot';
/** @inline */
export type GithubOauthProvider = 'github';
/** @inline */
export type TiktokOauthProvider = 'tiktok';
/** @inline */
export type GitlabOauthProvider = 'gitlab';
/** @inline */
export type DiscordOauthProvider = 'discord';
/** @inline */
export type TwitterOauthProvider = 'twitter';
/** @inline */
export type TwitchOauthProvider = 'twitch';
/** @inline */
export type LinkedinOauthProvider = 'linkedin';
/** @inline */
export type LinkedinOIDCOauthProvider = 'linkedin_oidc';
/** @inline */
export type DropboxOauthProvider = 'dropbox';
/** @inline */
export type AtlassianOauthProvider = 'atlassian';
/** @inline */
export type BitbucketOauthProvider = 'bitbucket';
/** @inline */
export type MicrosoftOauthProvider = 'microsoft';
/** @inline */
export type NotionOauthProvider = 'notion';
/** @inline */
export type AppleOauthProvider = 'apple';
/** @inline */
export type LineOauthProvider = 'line';
/** @inline */
export type InstagramOauthProvider = 'instagram';
/** @inline */
export type CoinbaseOauthProvider = 'coinbase';
/** @inline */
export type SpotifyOauthProvider = 'spotify';
/** @inline */
export type XeroOauthProvider = 'xero';
/** @inline */
export type BoxOauthProvider = 'box';
/** @inline */
export type SlackOauthProvider = 'slack';
/** @inline */
export type LinearOauthProvider = 'linear';
/** @inline */
export type XOauthProvider = 'x';
/** @inline */
export type EnstallOauthProvider = 'enstall';
/** @inline */
export type HuggingfaceOAuthProvider = 'huggingface';
/** @inline */
export type VercelOauthProvider = 'vercel';
/** @inline */
export type CustomOauthProvider = `custom_${string}`;

/** Represents the available OAuth providers. */
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
