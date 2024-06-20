type SameSiteAttributeType = 'None' | 'Lax' | 'Strict';

// The Secure attribute is required for SameSite=None on Chrome and Firefox
// Also, localhost is considered secure for testing purposes by Chrome and Firefox
// Safari does not support the Secure attribute on localhost, although it returns true for isSecureContext
// ref: https://bugs.webkit.org/show_bug.cgi?id=232088#c8
export const getSecureAttribute = (sameSite: SameSiteAttributeType) => {
  const httpsProtocol = window.location.protocol === 'https:';

  // Return true on Safari only for `https` protocol
  if (typeof (window as any).safari !== 'undefined') {
    return httpsProtocol;
  }

  if (typeof window.isSecureContext !== 'undefined') {
    return window.isSecureContext;
  }

  return httpsProtocol || (window.location.hostname === 'localhost' && sameSite === 'None');
};
