import type { EnterpriseSSOStrategy, OAuthStrategy, SamlStrategy } from './strategies';

export type AfterSignOutUrl = {
  /**
   * Full URL or path to navigate to after successful sign out.
   */
  afterSignOutUrl?: string | null;
};

export type AfterMultiSessionSingleSignOutUrl = {
  /**
   * Full URL or path to navigate to after signing out the current user is complete.
   * This option applies to multi-session applications.
   */
  afterMultiSessionSingleSignOutUrl?: string | null;
};

/**
 * @deprecated This is deprecated and will be removed in a future release.
 */
export type LegacyRedirectProps = {
  /**
   * @deprecated Use `fallbackRedirectUrl` or `forceRedirectUrl` instead.
   */
  afterSignInUrl?: string | null;
  /**
   * @deprecated Use `fallbackRedirectUrl` or `forceRedirectUrl` instead.
   */
  afterSignUpUrl?: string | null;
  /**
   * @deprecated Use `fallbackRedirectUrl` or `forceRedirectUrl` instead.
   */
  redirectUrl?: string | null;
};

/**
 * Redirect URLs for different actions.
 * Mainly used to be used to type internal Clerk functions.
 */
export type RedirectOptions = SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  LegacyRedirectProps;

export type AuthenticateWithRedirectParams = {
  /**
   * Full URL or path to the route that will complete the OAuth or SAML flow.
   * Typically, this will be a simple `/sso-callback` route that calls `Clerk.handleRedirectCallback`
   * or mounts the <AuthenticateWithRedirectCallback /> component.
   */
  redirectUrl: string;

  /**
   * Full URL or path to navigate to after the OAuth or SAML flow completes.
   */
  redirectUrlComplete: string;

  /**
   * Whether to continue (i.e. PATCH) an existing SignUp (if present) or create a new SignUp.
   */
  continueSignUp?: boolean;

  /**
   * One of the supported OAuth providers you can use to authenticate with, eg 'oauth_google'.
   * Alternatively `saml` or `enterprise_sso`, to authenticate with Enterprise SSO.
   */
  strategy: OAuthStrategy | SamlStrategy | EnterpriseSSOStrategy;

  /**
   * Identifier to use for targeting a Enterprise Connection at sign-in
   */
  identifier?: string;

  /**
   * Email address to use for targeting a Enterprise Connection at sign-up
   */
  emailAddress?: string;

  /**
   * Whether the user has accepted the legal requirements.
   */
  legalAccepted?: boolean;
};

export type AuthenticateWithPopupParams = AuthenticateWithRedirectParams & { popup: Window | null };

export type RedirectUrlProp = {
  /**
   * Full URL or path to navigate to after a successful action.
   */
  redirectUrl?: string | null;
};

export type SignUpForceRedirectUrl = {
  /**
   * If provided, this URL will always be redirected to after the user signs up. It's recommended to use the [environment variable](https://clerk.com/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   */
  signUpForceRedirectUrl?: string | null;
};

export type SignUpFallbackRedirectUrl = {
  /**
   * The fallback URL to redirect to after the user signs up, if there's no `redirect_url` in the path already. Defaults to `/`. It's recommended to use the [environment variable](https://clerk.com/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   */
  signUpFallbackRedirectUrl?: string | null;
};

export type SignInFallbackRedirectUrl = {
  /**
   * The fallback URL to redirect to after the user signs in, if there's no `redirect_url` in the path already. Defaults to `/`. It's recommended to use the [environment variable](https://clerk.com/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   */
  signInFallbackRedirectUrl?: string | null;
};

export type SignInForceRedirectUrl = {
  /**
   * If provided, this URL will always be redirected to after the user signs in. It's recommended to use the [environment variable](https://clerk.com/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   */
  signInForceRedirectUrl?: string | null;
};
