import { createCookieHandler } from '@clerk/shared/cookie';
import { getSuffixedCookieName } from '@clerk/shared/keys';

const HANDSHAKE_FORMAT_COOKIE_NAME = '__clerk_handshake_format';

export type HandshakeFormatDetector = {
  supportsNonce: () => boolean;
};

/**
 * Create a utility to detect if the backend supports nonce handshakes
 * by reading the handshake format cookie set by the backend
 */
export const createHandshakeFormatDetector = (cookieSuffix: string): HandshakeFormatDetector => {
  const handshakeFormatCookie = createCookieHandler(HANDSHAKE_FORMAT_COOKIE_NAME);
  const suffixedHandshakeFormatCookie = createCookieHandler(
    getSuffixedCookieName(HANDSHAKE_FORMAT_COOKIE_NAME, cookieSuffix),
  );

  const supportsNonce = (): boolean => {
    const value = suffixedHandshakeFormatCookie.get() || handshakeFormatCookie.get();
    return value === 'nonce';
  };

  return {
    supportsNonce,
  };
};
