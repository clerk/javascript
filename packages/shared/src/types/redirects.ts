import type { HandleOAuthCallbackParams } from './clerk';
import type { EnterpriseSSOStrategy, OAuthStrategy } from './strategies';

/** @generateWithEmptyComment */
export type AfterSignOutUrl = {
  /**
   * The full URL or path to navigate to after successful sign out.
   */
  afterSignOutUrl?: string | null;
};

/** @generateWithEmptyComment */
export type AfterMultiSessionSingleSignOutUrl = {
  /**
   * The full URL or path to navigate to after signing out the current user is complete.
   * This option applies to [multi-session applications](https://clerk.com/docs/guides/secure/session-options#multi-session-applications).
   */
  afterMultiSessionSingleSignOutUrl?: string | null;
};

/**
 * Redirect URLs for different actions.
 */
export type RedirectOptions = SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  RedirectUrlProp;

/** @generateWithEmptyComment */
export type AuthenticateWithRedirectParams = {
  /**
   * The full URL or path to the route that will complete the OAuth or SAML flow.
   * Typically, this will be a simple `/sso-callback` route that calls `Clerk.handleRedirectCallback`
   * or mounts the <AuthenticateWithRedirectCallback /> component.
   */
  redirectUrl: string;

  /**
   * The full URL or path to navigate to after the OAuth or SAML flow completes.
   */
  redirectUrlComplete: string;

  /**
   * Whether to continue (i.e. PATCH) an existing SignUp (if present) or create a new SignUp.
   */
  continueSignUp?: boolean;

  /**
   * Whether to continue existing SignIn (if present) or create a new SignIn.
   */
  continueSignIn?: boolean;

  /**
   * One of the supported OAuth providers you can use to authenticate with, eg 'oauth_google'.
   * Alternatively `enterprise_sso`, to authenticate with Enterprise SSO.
   */
  strategy: OAuthStrategy | EnterpriseSSOStrategy;

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

  /**
   * Optional for `oauth_<provider>` or `enterprise_sso` strategies. The value to pass to the [OIDC prompt parameter](https://openid.net/specs/openid-connect-core-1_0.html#:~:text=prompt,reauthentication%20and%20consent.) in the generated OAuth redirect URL.
   */
  oidcPrompt?: string;

  /**
   * Internal OAuth callback context, consumed only when an OAuth transport completes the
   * flow in-process. Ignored by the web redirect/popup paths. Shape matches the params
   * the prebuilt SSO callback route passes to `handleRedirectCallback`.
   *
   * @internal
   */
  __internal_callbackParams?: HandleOAuthCallbackParams;

  /**
   * @experimental
   */
  enterpriseConnectionId?: string;
};

export type AuthenticateWithPopupParams = AuthenticateWithRedirectParams & { popup: Window | null };

/** @generateWithEmptyComment */
export type RedirectUrlProp = {
  /**
   * Full URL or path to navigate to after a successful action.
   */
  redirectUrl?: string | null;
};

/** @generateWithEmptyComment */
export type SignUpForceRedirectUrl = {
  /**
   * If provided, this URL will always be redirected to after the user signs up. It's recommended to use the [environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   */
  signUpForceRedirectUrl?: string | null;
};

/** @generateWithEmptyComment */
export type SignUpFallbackRedirectUrl = {
  /**
   * The fallback URL to redirect to after the user signs up, if there's no `redirect_url` in the path already. It's recommended to use the [environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   *
   * @default '/'
   */
  signUpFallbackRedirectUrl?: string | null;
};

/** @generateWithEmptyComment */
export type SignInFallbackRedirectUrl = {
  /**
   * The fallback URL to redirect to after the user signs in, if there's no `redirect_url` in the path already. It's recommended to use the [environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   *
   * @default '/'
   */
  signInFallbackRedirectUrl?: string | null;
};

/** @generateWithEmptyComment */
export type SignInForceRedirectUrl = {
  /**
   * If provided, this URL will always be redirected to after the user signs in. It's recommended to use the [environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
   */
  signInForceRedirectUrl?: string | null;
};

/** @generateWithEmptyComment */
export type NewSubscriptionRedirectUrl = {
  /**
   * The full URL or path to navigate to after the user completes the checkout and clicks the "Continue" button.
   */
  newSubscriptionRedirectUrl?: string | null;
};
