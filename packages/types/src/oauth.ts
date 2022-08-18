import { OAuthStrategy } from './strategies';

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
export type DropboxOauthProvider = 'dropbox';
export type BitbucketOauthProvider = 'bitbucket';
export type MicrosoftOauthProvider = 'microsoft';
export type NotionOauthProvider = 'notion';
export type AppleOauthProvider = 'apple';
export type LineOauthProvider = 'line';
export type InstagramOauthProvider = 'instagram';

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
  | DropboxOauthProvider
  | BitbucketOauthProvider
  | MicrosoftOauthProvider
  | NotionOauthProvider
  | AppleOauthProvider
  | LineOauthProvider
  | InstagramOauthProvider;

export const OAUTH_PROVIDERS: OAuthProviderData[] = [
  {
    provider: 'google',
    strategy: 'oauth_google',
    name: 'Google',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-google',
  },
  {
    provider: 'discord',
    strategy: 'oauth_discord',
    name: 'Discord',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-discord',
  },
  {
    provider: 'facebook',
    strategy: 'oauth_facebook',
    name: 'Facebook',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-facebook',
  },
  {
    provider: 'twitch',
    strategy: 'oauth_twitch',
    name: 'Twitch',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-twitch',
  },
  {
    provider: 'twitter',
    strategy: 'oauth_twitter',
    name: 'Twitter',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-twitter',
  },
  {
    provider: 'microsoft',
    strategy: 'oauth_microsoft',
    name: 'Microsoft',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-microsoft',
  },
  {
    provider: 'tiktok',
    strategy: 'oauth_tiktok',
    name: 'TikTok',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-tiktok',
  },
  {
    provider: 'linkedin',
    strategy: 'oauth_linkedin',
    name: 'LinkedIn',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-linkedin',
  },
  {
    provider: 'github',
    strategy: 'oauth_github',
    name: 'GitHub',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-github',
  },
  {
    provider: 'gitlab',
    strategy: 'oauth_gitlab',
    name: 'GitLab',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-gitlab',
  },
  {
    provider: 'dropbox',
    strategy: 'oauth_dropbox',
    name: 'Dropbox',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-dropbox',
  },
  {
    provider: 'bitbucket',
    strategy: 'oauth_bitbucket',
    name: 'Bitbucket',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-bitbucket',
  },
  {
    provider: 'hubspot',
    strategy: 'oauth_hubspot',
    name: 'HubSpot',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-hubspot',
  },
  {
    provider: 'notion',
    strategy: 'oauth_notion',
    name: 'Notion',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-notion',
  },
  {
    provider: 'apple',
    strategy: 'oauth_apple',
    name: 'Apple',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-apple',
  },
  {
    provider: 'line',
    strategy: 'oauth_line',
    name: 'LINE',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-line',
  },
  {
    provider: 'instagram',
    strategy: 'oauth_instagram',
    name: 'Instagram',
    docsUrl: 'https://clerk.dev/docs/authentication/social-login-with-instagram',
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

export type AuthenticateWithRedirectParams = {
  /**
   * One of the supported OAuth providers you can use to authenticate with, eg 'oauth_google'.
   */
  strategy: OAuthStrategy;
  /**
   * Full URL or path to the route that will complete the OAuth flow.
   * Typically, this will be a simple `/sso-callback` route that calls `Clerk.handleRedirectCallback`
   * or mounts the <AuthenticateWithRedirectCallback /> component.
   */
  redirectUrl: string;
  /**
   * Full URL or path to navigate after the OAuth flow completes.
   */
  redirectUrlComplete: string;
};
