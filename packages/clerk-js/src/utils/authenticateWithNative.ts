import { ClerkRuntimeError } from '@clerk/shared/error';
import { parseNativeOAuthCallback } from '@clerk/shared/internal/clerk-js/nativeOAuth';

import type { Clerk } from '../core/clerk';

/**
 * Returns the native callback URL to bake into an OAuth `create` call when a native OAuth handler is
 * registered, otherwise `undefined`. Callers apply it to every FAPI redirect field (both `redirect_url`
 * and `action_complete_redirect_url`) so the flow always returns to the app's native callback rather
 * than a web route the system browser cannot reach.
 *
 * This is the single place the web-vs-native redirect decision is made, so the SignIn/SignUp and
 * connected-account flows cannot diverge on it.
 */
export function getNativeRedirectUrl(clerk: Clerk): Promise<string> | undefined {
  return clerk?.__internal_nativeOAuthHandler?.getRedirectUrl();
}

/**
 * Builds the `navigateCallback` for a SignIn/SignUp native OAuth redirect: it opens the system browser
 * via the registered handler and, once the rotating token nonce arrives, resumes the standard Clerk
 * redirect-callback handling in place (reusing all web branching: transfer, second factor, continue).
 */
export function nativeRedirectCallback(
  clerk: Clerk,
  reloadResource: 'signIn' | 'signUp',
  redirectUrlComplete: string,
): (url: URL | string) => Promise<void> {
  return url =>
    _authenticateWithNative(clerk, {
      externalVerificationRedirectURL: new URL(url),
      resume: ({ rotatingTokenNonce }) =>
        clerk.handleRedirectCallback({
          rotatingTokenNonce,
          reloadResource,
          signInForceRedirectUrl: redirectUrlComplete,
          signUpForceRedirectUrl: redirectUrlComplete,
        }),
    });
}

/**
 * Drives the system-browser half of an OAuth/SSO verification through the registered native handler,
 * then hands control back to the caller's `resume` so the appropriate resource can be reloaded with
 * the rotating token nonce.
 *
 * This is the native sibling of {@link _authenticateWithPopup}: where popup flows complete via a
 * `message` event from Account Portal, native flows complete via a custom-scheme callback URL the OS
 * hands back. Both ultimately produce the verified state needed to finish the standard Clerk flow.
 *
 * Behavior:
 * - The handler reports a cancellation → resolves quietly so the component returns to idle.
 * - The handler rejects (timeout/failure) → the rejection propagates to the caller's error handling.
 * - The callback carries an `error` param → throws a {@link ClerkRuntimeError} for standard handling.
 * - The callback carries a `rotating_token_nonce` → invokes `resume` with it.
 */
export async function _authenticateWithNative(
  clerk: Clerk,
  {
    externalVerificationRedirectURL,
    resume,
  }: {
    externalVerificationRedirectURL: URL;
    resume: (result: { rotatingTokenNonce: string }) => Promise<unknown>;
  },
): Promise<void> {
  const handler = clerk.__internal_nativeOAuthHandler;
  if (!handler) {
    return;
  }

  const result = await handler.open(externalVerificationRedirectURL);

  if (result.type !== 'success') {
    return;
  }

  const callback = parseNativeOAuthCallback(result.callbackUrl);
  if (callback.error || !callback.rotatingTokenNonce) {
    throw new ClerkRuntimeError(callback.error || 'Native OAuth flow did not complete', {
      code: 'native_oauth_error',
    });
  }

  await resume({ rotatingTokenNonce: callback.rotatingTokenNonce });
}
