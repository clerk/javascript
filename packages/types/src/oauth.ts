import { type ProviderData, ProviderType } from './providers';
import type { OAuthStrategy } from './strategies';

export type OAuthScope = string;

export interface OAuthProviderData extends ProviderData {
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
  | LinearOauthProvider;

export const OAUTH_PROVIDERS: OAuthProviderData[] = [
  {
    provider: 'google',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_google',
    name: 'Google',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-google',
  },
  {
    provider: 'discord',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_discord',
    name: 'Discord',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-discord',
  },
  {
    provider: 'facebook',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_facebook',
    name: 'Facebook',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-facebook',
  },
  {
    provider: 'twitch',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_twitch',
    name: 'Twitch',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-twitch',
  },
  {
    provider: 'twitter',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_twitter',
    name: 'Twitter',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-twitter',
  },
  {
    provider: 'microsoft',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_microsoft',
    name: 'Microsoft',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-microsoft',
  },
  {
    provider: 'tiktok',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_tiktok',
    name: 'TikTok',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-tiktok',
  },
  {
    provider: 'linkedin',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_linkedin',
    name: 'LinkedIn',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-linkedin',
  },
  {
    provider: 'linkedin_oidc',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_linkedin_oidc',
    name: 'LinkedIn',
    docsUrl: 'https://clerk.com/docs/authentication/social-connections/linkedin-oidc',
  },
  {
    provider: 'github',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_github',
    name: 'GitHub',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-github',
  },
  {
    provider: 'gitlab',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_gitlab',
    name: 'GitLab',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-gitlab',
  },
  {
    provider: 'dropbox',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_dropbox',
    name: 'Dropbox',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-dropbox',
  },
  {
    provider: 'atlassian',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_atlassian',
    name: 'Atlassian',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-atlassian',
  },
  {
    provider: 'bitbucket',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_bitbucket',
    name: 'Bitbucket',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-bitbucket',
  },
  {
    provider: 'hubspot',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_hubspot',
    name: 'HubSpot',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-hubspot',
  },
  {
    provider: 'notion',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_notion',
    name: 'Notion',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-notion',
  },
  {
    provider: 'apple',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_apple',
    name: 'Apple',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-apple',
  },
  {
    provider: 'line',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_line',
    name: 'LINE',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-line',
  },
  {
    provider: 'instagram',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_instagram',
    name: 'Instagram',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-instagram',
  },
  {
    provider: 'coinbase',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_coinbase',
    name: 'Coinbase',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-coinbase',
  },
  {
    provider: 'spotify',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_spotify',
    name: 'Spotify',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-spotify',
  },
  {
    provider: 'xero',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_xero',
    name: 'Xero',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-xero',
  },
  {
    provider: 'box',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_box',
    name: 'Box',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-box',
  },
  {
    provider: 'slack',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_slack',
    name: 'Slack',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-slack',
  },
  {
    provider: 'linear',
    providerType: ProviderType.OAuth,
    strategy: 'oauth_linear',
    name: 'Linear',
    docsUrl: 'https://clerk.com/docs/authentication/social-connection-with-linear',
  },
];

interface getOAuthProviderDataProps {
  provider?: OAuthProvider;
  strategy?: OAuthStrategy;
}

export function getOAuthProviderData({
  provider,
  strategy,
}: getOAuthProviderDataProps): OAuthProviderData | undefined | null {
  if (provider) {
    return OAUTH_PROVIDERS.find(oauth_provider => oauth_provider.provider == provider);
  }

  return OAUTH_PROVIDERS.find(oauth_provider => oauth_provider.strategy == strategy);
}

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
