import { constants, SUPPORTED_HANDSHAKE_FORMAT } from '../constants';
import type { AuthenticateContext } from '../tokens/authenticateContext';

/**
 * Appends handshake format query parameter to an OAuth callback URL
 * so that FAPI knows the backend can handle nonce-based handshakes
 *
 * @param url - The OAuth callback URL to modify
 * @param authenticateContext - The authentication context containing handshake format info
 * @returns The modified URL with handshake format parameter
 */
export function appendHandshakeFormatToOAuthCallback(url: string, authenticateContext: AuthenticateContext): string {
  const callbackUrl = new URL(url);

  // If the backend can handle nonce handshakes, add the format parameter
  if (authenticateContext.canHandleNonceHandshake()) {
    callbackUrl.searchParams.set(constants.QueryParameters.HandshakeFormat, SUPPORTED_HANDSHAKE_FORMAT);
  }

  return callbackUrl.toString();
}

/**
 * Enhances an OAuth redirect URL by appending handshake format parameter to the callback URL
 * This is used when creating external accounts or initiating OAuth flows
 *
 * @param redirectUrl - The redirect URL to modify (contains oauth_callback)
 * @param authenticateContext - The authentication context
 * @returns The enhanced redirect URL with handshake format parameter
 */
export function enhanceOAuthRedirectUrl(redirectUrl: string, authenticateContext: AuthenticateContext): string {
  if (!redirectUrl || !authenticateContext.canHandleNonceHandshake()) {
    return redirectUrl;
  }

  try {
    const url = new URL(redirectUrl);

    // Check if this URL contains oauth_callback path - if so, add the format parameter
    if (url.pathname.includes('oauth_callback') || url.pathname.includes('oauth-callback')) {
      url.searchParams.set(constants.QueryParameters.HandshakeFormat, SUPPORTED_HANDSHAKE_FORMAT);
      return url.toString();
    }

    // For other OAuth-related URLs, check if they have callback-related query parameters
    const callbackUrl = url.searchParams.get('redirect_url') || url.searchParams.get('redirectUrl');
    if (callbackUrl) {
      try {
        const enhancedCallback = appendHandshakeFormatToOAuthCallback(callbackUrl, authenticateContext);
        url.searchParams.set('redirect_url', enhancedCallback);
        return url.toString();
      } catch {
        // If callback URL parsing fails, return original URL
        return redirectUrl;
      }
    }
  } catch {
    // If URL parsing fails, return original URL
    return redirectUrl;
  }

  return redirectUrl;
}

/**
 * Gets the handshake format cookie value
 *
 * @param authenticateContext - The authentication context
 * @returns The cookie string if nonce is supported, null otherwise
 */
export function getHandshakeFormatCookie(authenticateContext: AuthenticateContext): string | null {
  if (!authenticateContext.canHandleNonceHandshake()) {
    return null;
  }

  return `${constants.Cookies.HandshakeFormat}=${SUPPORTED_HANDSHAKE_FORMAT}; Path=/; SameSite=None; Secure`;
}

/**
 * Creates headers with handshake format cookie for OAuth flows
 *
 * @param authenticateContext - The authentication context
 * @returns Headers object with Set-Cookie header if nonce is supported
 */
export function createHandshakeFormatHeaders(authenticateContext: AuthenticateContext): Headers {
  const headers = new Headers();
  const cookie = getHandshakeFormatCookie(authenticateContext);

  if (cookie) {
    headers.append('Set-Cookie', cookie);
  }

  return headers;
}
