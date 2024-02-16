import { isValidBrowser } from '@clerk/shared/browser';

export async function isSupportedPasskeysSupported() {
  if (!isValidBrowser()) {
    return Promise.reject('Non valid browser');
  }
  if (
    typeof window?.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable !== 'function' ||
    typeof window?.PublicKeyCredential?.isConditionalMediationAvailable !== 'function'
  ) {
    return Promise.reject('Not supported');
  }

  try {
    const results = await Promise.all([
      // Is platform authenticator available in this browser?
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),

      // Is conditional UI available in this browser?
      PublicKeyCredential.isConditionalMediationAvailable(),
    ]);

    if (results.every(r => r === true)) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  } catch (e) {
    return Promise.reject('Something failed');
  }
}
