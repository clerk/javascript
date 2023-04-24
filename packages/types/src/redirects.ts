import type { OAuthStrategy, SamlStrategy } from './strategies';

export type AuthenticateWithRedirectParams = {
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

  /**
   * Whether to continue (i.e. PATCH) an existing SignUp (if present) or create a new SignUp.
   */
  continueSignUp?: boolean;

  /**
   * One of the supported OAuth providers you can use to authenticate with, eg 'oauth_google'.
   * Or alternatively `saml`, to authenticate with SAML.
   */
  strategy: OAuthStrategy | SamlStrategy;

  /**
   * Identifier to use for targeting a SAML connection at sign-in
   */
  identifier?: string;

  /**
   * Email address to use for targeting a SAML connection at sign-up
   */
  emailAddress?: string;
};
