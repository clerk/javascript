import { constants, SUPPORTED_HANDSHAKE_FORMAT, SUPPORTS_HANDSHAKE_NONCE } from '../constants';
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
 * Gets the handshake format cookie value that indicates nonce capability
 *
 * @param authenticateContext - The authentication context
 * @returns Cookie string if nonce handshakes are supported, null otherwise
 */
export function getHandshakeFormatCookie(authenticateContext: AuthenticateContext): string | null {
  if (authenticateContext.canHandleNonceHandshake()) {
    return `${constants.Cookies.HandshakeFormat}=${SUPPORTED_HANDSHAKE_FORMAT}; Path=/; SameSite=None; Secure`;
  }
  return null;
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
