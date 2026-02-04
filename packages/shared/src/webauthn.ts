import { isValidBrowser } from './browser';

/**
 *
 */
function isWebAuthnSupported() {
  return (
    isValidBrowser() &&
    // Check if `PublicKeyCredential` is a constructor
    typeof window.PublicKeyCredential === 'function'
  );
}

/**
 *
 */
async function isWebAuthnAutofillSupported(): Promise<boolean> {
  try {
    return isWebAuthnSupported() && (await window.PublicKeyCredential.isConditionalMediationAvailable());
  } catch {
    return false;
  }
}

/**
 *
 */
async function isWebAuthnPlatformAuthenticatorSupported(): Promise<boolean> {
  try {
    return (
      typeof window !== 'undefined' &&
      (await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    return false;
  }
}

export { isWebAuthnPlatformAuthenticatorSupported, isWebAuthnAutofillSupported, isWebAuthnSupported };
