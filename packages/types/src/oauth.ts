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
  | CustomOauthProvider;

/**
 * @deprecated This utility will be dropped in the next major release.
 * You can import it from `@clerk/shared/oauth`.
 */
export const OAUTH_PROVIDERS: OAuthProviderData[] = [
  {
    provider: 'google',
    strategy: 'oauth_google',
    name: 'Google',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/google',
  },
  {
    provider: 'discord',
    strategy: 'oauth_discord',
    name: 'Discord',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/discord',
  },
  {
    provider: 'facebook',
    strategy: 'oauth_facebook',
    name: 'Facebook',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/facebook',
  },
  {
    provider: 'twitch',
    strategy: 'oauth_twitch',
    name: 'Twitch',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/twitch',
  },
  {
    provider: 'twitter',
    strategy: 'oauth_twitter',
    name: 'Twitter',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/twitter',
  },
  {
    provider: 'microsoft',
    strategy: 'oauth_microsoft',
    name: 'Microsoft',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/microsoft',
  },
  {
    provider: 'tiktok',
    strategy: 'oauth_tiktok',
    name: 'TikTok',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/tiktok',
  },
  {
    provider: 'linkedin',
    strategy: 'oauth_linkedin',
    name: 'LinkedIn',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/linkedin',
  },
  {
    provider: 'linkedin_oidc',
    strategy: 'oauth_linkedin_oidc',
    name: 'LinkedIn',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/linkedin-oidc',
  },
  {
    provider: 'github',
    strategy: 'oauth_github',
    name: 'GitHub',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/github',
  },
  {
    provider: 'gitlab',
    strategy: 'oauth_gitlab',
    name: 'GitLab',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/gitlab',
  },
  {
    provider: 'dropbox',
    strategy: 'oauth_dropbox',
    name: 'Dropbox',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/dropbox',
  },
  {
    provider: 'atlassian',
    strategy: 'oauth_atlassian',
    name: 'Atlassian',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/atlassian',
  },
  {
    provider: 'bitbucket',
    strategy: 'oauth_bitbucket',
    name: 'Bitbucket',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/bitbucket',
  },
  {
    provider: 'hubspot',
    strategy: 'oauth_hubspot',
    name: 'HubSpot',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/hubspot',
  },
  {
    provider: 'notion',
    strategy: 'oauth_notion',
    name: 'Notion',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/notion',
  },
  {
    provider: 'apple',
    strategy: 'oauth_apple',
    name: 'Apple',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/apple',
  },
  {
    provider: 'line',
    strategy: 'oauth_line',
    name: 'LINE',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/line',
  },
  {
    provider: 'instagram',
    strategy: 'oauth_instagram',
    name: 'Instagram',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/instagram',
  },
  {
    provider: 'coinbase',
    strategy: 'oauth_coinbase',
    name: 'Coinbase',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/coinbase',
  },
  {
    provider: 'spotify',
    strategy: 'oauth_spotify',
    name: 'Spotify',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/spotify',
  },
  {
    provider: 'xero',
    strategy: 'oauth_xero',
    name: 'Xero',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/xero',
  },
  {
    provider: 'box',
    strategy: 'oauth_box',
    name: 'Box',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/box',
  },
  {
    provider: 'slack',
    strategy: 'oauth_slack',
    name: 'Slack',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/slack',
  },
  {
    provider: 'linear',
    strategy: 'oauth_linear',
    name: 'Linear',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/linear',
  },
  {
    provider: 'x',
    strategy: 'oauth_x',
    name: 'X / Twitter',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/x-twitter-v2',
  },
  {
    provider: 'enstall',
    strategy: 'oauth_enstall',
    name: 'Enstall',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/enstall',
  },
  {
    provider: 'huggingface',
    strategy: 'oauth_huggingface',
    name: 'Hugging Face',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/huggingface',
  },
];

interface getOAuthProviderDataProps {
  provider?: OAuthProvider;
  strategy?: OAuthStrategy;
}

/**
 * @deprecated This utility will be dropped in the next major release.
 */
export function getOAuthProviderData({
  provider,
  strategy,
}: getOAuthProviderDataProps): OAuthProviderData | undefined | null {
  if (provider) {
    return OAUTH_PROVIDERS.find(oauth_provider => oauth_provider.provider == provider);
  }

  return OAUTH_PROVIDERS.find(oauth_provider => oauth_provider.strategy == strategy);
}

/**
 * @deprecated This utility will be dropped in the next major release.
 */
export function sortedOAuthProviders(sortingArray: OAuthStrategy[]) {
  return OAUTH_PROVIDERS.slice().sort((a, b) => {
    let aPos = sortingArray.indexOf(a.strategy);
    if (aPos == -1) {
      aPos = Number.MAX_SAFE_INTEGER;
    }

    let bPos = sortingArray.indexOf(b.strategy);
    if (bPos == -1) {
      bPos = Number.MAX_SAFE_INTEGER;
    }

    return aPos - bPos;
  });
}
