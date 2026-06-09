/**
 * The normalized outcome of a native OAuth/SSO callback URL. Either the rotating token nonce that
 * the relevant SignIn/SignUp resource (or User, for connected accounts) must reload with, or an
 * error string suitable for surfacing through the standard Clerk error handling.
 */
export type NativeOAuthCallbackResult =
  | { rotatingTokenNonce: string; error?: undefined }
  | { rotatingTokenNonce?: undefined; error: string };

/**
 * Turns a custom-scheme native callback URL (e.g. `myapp://sso-callback?rotating_token_nonce=...`)
 * into a normalized result. This is the single place native callback URLs are interpreted, so web
 * and native flows cannot silently diverge on how a callback is read.
 */
export function parseNativeOAuthCallback(callbackUrl: string): NativeOAuthCallbackResult {
  let params: URLSearchParams;
  try {
    params = new URL(callbackUrl).searchParams;
  } catch {
    return { error: 'Invalid native OAuth callback URL' };
  }

  const error = params.get('error');
  if (error) {
    return { error: params.get('error_description') || error };
  }

  const rotatingTokenNonce = params.get('rotating_token_nonce');
  if (rotatingTokenNonce) {
    return { rotatingTokenNonce };
  }

  return { error: 'Native OAuth callback did not include a rotating_token_nonce' };
}
