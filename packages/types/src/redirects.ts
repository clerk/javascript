import type { OAuthStrategy, SamlStrategy } from './strategies';

export type AfterSignOutUrl = {
  /**
   * Full URL or path to navigate after successful sign out.
   */
  afterSignOutUrl?: string | null;
};

export type AfterMultiSessionSingleSignOutUrl = {
  /**
   * Full URL or path to navigate after signing out the current user is complete.
   * This option applies to multi-session applications.
   */
  afterMultiSessionSingleSignOutUrl?: string | null;
};

/**
 * @deprecated This is deprecated and will be removed in a future release.
 */
export type LegacyRedirectProps = {
  /**
   * @deprecated This is deprecated and will be removed in a future release.
   * Use `fallbackRedirectUrl` or `forceRedirectUrl` instead.
   */
  afterSignInUrl?: string | null;
  /**
   * @deprecated This is deprecated and will be removed in a future release.
   * Use `fallbackRedirectUrl` or `forceRedirectUrl` instead.
   */
  afterSignUpUrl?: string | null;
  /**
   * @deprecated This is deprecated and will be removed in a future release.
   * Use `fallbackRedirectUrl` or `forceRedirectUrl` instead.
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
   * Full URL or path to navigate after the OAuth or SAML flow completes.
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

  /**
   * Whether the user has accepted the legal requirements.
   */
  legalAccepted?: boolean;
};

export type RedirectUrlProp = {
  /**
   * Full URL or path to navigate after a successful action.
   */
  redirectUrl?: string | null;
};

export type SignUpForceRedirectUrl = {
  /**
   * Full URL or path to navigate after successful sign up.
   * This value has precedence over other redirect props, environment variables or search params.
   * Use this prop to override the redirect URL when needed.
   * @default undefined
   */
  signUpForceRedirectUrl?: string | null;
};

export type SignUpFallbackRedirectUrl = {
  /**
   * Full URL or path to navigate after successful sign up.
   * This value is used when no other redirect props, environment variables or search params are present.
   * @default undefined
   */
  signUpFallbackRedirectUrl?: string | null;
};

export type SignInFallbackRedirectUrl = {
  /**
   * Full URL or path to navigate after successful sign in.
   * This value is used when no other redirect props, environment variables or search params are present.
   * @default undefined
   */
  signInFallbackRedirectUrl?: string | null;
};

export type SignInForceRedirectUrl = {
  /**
   * Full URL or path to navigate after successful sign in.
   * This value has precedence over other redirect props, environment variables or search params.
   * Use this prop to override the redirect URL when needed.
   * @default undefined
   */
  signInForceRedirectUrl?: string | null;
};
