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

/**
 * @deprecated `OAuthCallbacks` has been deprecated and will be removed soon.
 * Use {@link AuthenticateWithRedirectParams}, SignIn.authenticateWithRedirect() or SignUp.authenticateWithRedirect() instead.
 */
export type OAuthCallbacks = {
  callbackUrl: string;
  callbackUrlComplete: string;
};

export type AuthenticateWithRedirectParams = {
  /**
   * One of the supported OAuth providers you can use to authenticate with, eg 'oauth_google'.
   */
  strategy: OAuthStrategy;
} & (
  | {
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
      callbackUrl?: never;
      callbackUrlComplete?: never;
    }
  | {
      /**
       * @deprecated `callbackUrl` has been deprecated and will be removed soon.
       * Use {@link AuthenticateWithRedirectParams.redirectUrl} instead.
       */
      callbackUrl: string;
      /**
       * @deprecated `callbackUrlComplete` has been deprecated and will be removed soon.
       * Use {@link AuthenticateWithRedirectParams.redirectUrlComplete} instead.
       */
      callbackUrlComplete: string;
      redirectUrl?: never;
      redirectUrlComplete?: never;
    }
);
