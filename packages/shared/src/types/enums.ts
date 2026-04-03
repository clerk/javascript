import type { OAuthProvider } from './oauth';
import type { OAuthStrategy } from './strategies';

/**
 * OAuth Provider enum object with camelCased keys mapping to provider names
 * @example
 * OAuthProviderEnum.google // 'google'
 * OAuthProviderEnum.linkedinOidc // 'linkedin_oidc'
 */
export const OAuthProviderEnum = {
  facebook: 'facebook',
  google: 'google',
  hubspot: 'hubspot',
  github: 'github',
  tiktok: 'tiktok',
  gitlab: 'gitlab',
  discord: 'discord',
  twitter: 'twitter',
  twitch: 'twitch',
  linkedin: 'linkedin',
  linkedinOidc: 'linkedin_oidc',
  dropbox: 'dropbox',
  atlassian: 'atlassian',
  bitbucket: 'bitbucket',
  microsoft: 'microsoft',
  notion: 'notion',
  apple: 'apple',
  line: 'line',
  instagram: 'instagram',
  coinbase: 'coinbase',
  spotify: 'spotify',
  xero: 'xero',
  box: 'box',
  slack: 'slack',
  linear: 'linear',
  x: 'x',
  enstall: 'enstall',
  huggingface: 'huggingface',
  vercel: 'vercel',
} as const;

export type OAuthProviderEnum = Extract<(typeof OAuthProviderEnum)[keyof typeof OAuthProviderEnum], OAuthProvider>;

/**
 * OAuth Strategy enum object with camelCased keys mapping to clerk strategy format
 * Automatically generates "oauth_${provider}" values
 * @example
 * OAuthStrategyEnum.google // 'oauth_google'
 * OAuthStrategyEnum.linkedinOidc // 'oauth_linkedin_oidc'
 */
export const OAuthStrategyEnum = {
  facebook: 'oauth_facebook' as const,
  google: 'oauth_google' as const,
  hubspot: 'oauth_hubspot' as const,
  github: 'oauth_github' as const,
  tiktok: 'oauth_tiktok' as const,
  gitlab: 'oauth_gitlab' as const,
  discord: 'oauth_discord' as const,
  twitter: 'oauth_twitter' as const,
  twitch: 'oauth_twitch' as const,
  linkedin: 'oauth_linkedin' as const,
  linkedinOidc: 'oauth_linkedin_oidc' as const,
  dropbox: 'oauth_dropbox' as const,
  atlassian: 'oauth_atlassian' as const,
  bitbucket: 'oauth_bitbucket' as const,
  microsoft: 'oauth_microsoft' as const,
  notion: 'oauth_notion' as const,
  apple: 'oauth_apple' as const,
  line: 'oauth_line' as const,
  instagram: 'oauth_instagram' as const,
  coinbase: 'oauth_coinbase' as const,
  spotify: 'oauth_spotify' as const,
  xero: 'oauth_xero' as const,
  box: 'oauth_box' as const,
  slack: 'oauth_slack' as const,
  linear: 'oauth_linear' as const,
  x: 'oauth_x' as const,
  enstall: 'oauth_enstall' as const,
  huggingface: 'oauth_huggingface' as const,
  vercel: 'oauth_vercel' as const,
} as const;

export type OAuthStrategyEnum = Extract<(typeof OAuthStrategyEnum)[keyof typeof OAuthStrategyEnum], OAuthStrategy>;
