import type { OAuthStrategy } from './strategies';

export type OAuthScope = string;

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
