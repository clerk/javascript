export type OAuthProvider =
  | 'facebook'
  | 'google'
  | 'hubspot'
  | 'github'
  | 'tiktok'
  | 'gitlab'
  | 'discord'
  | 'twitter'
  | 'twitch'
  | 'linkedin'
  | 'dropbox'
  | 'bitbucket';

export type OAuthStrategy = `oauth_${OAuthProvider}`;

export type AuthenticateWithRedirectParams = {
  /**
   * One of the supported OAuth providers you can use to authenticate with, eg 'oauth_google'.
   */
  strategy: OAuthStrategy;
} & {
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
