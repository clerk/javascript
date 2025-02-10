type SameSiteAttributeType = 'None' | 'Lax' | 'Strict';

// The Secure attribute is required for SameSite=None on Chrome and Firefox
// Also, localhost is considered secure for testing purposes by Chrome and Firefox
// Safari does not support the Secure attribute on localhost, although it returns true for isSecureContext
// ref: https://bugs.webkit.org/show_bug.cgi?id=232088#c8
export const getSecureAttribute = (sameSite: SameSiteAttributeType): boolean => {
  if (window.location.protocol === 'https:') {
    return true;
  }

  // If the cookie is not SameSite=None, then the Secure attribute is not required
  if (sameSite !== 'None') {
    return false;
  }

  // This is because Safari does not support the Secure attribute on localhost
  if (typeof (window as any).safari !== 'undefined') {
    return false;
  }

  // This is a useful way to check if the current context is secure
  // This is needed for example in environments like Firefox Remote Control
  // where the `localhost` is not considered secure
  if (typeof window.isSecureContext !== 'undefined') {
    return window.isSecureContext;
  }

  return window.location.hostname === 'localhost';
};
