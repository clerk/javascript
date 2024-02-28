import { isValidBrowser } from '@clerk/shared/browser';
import { ClerkRuntimeError } from '@clerk/shared/error';

function isWebAuthnSupported() {
  return (
    isValidBrowser() &&
    // Check if `PublicKeyCredential` is a constructor
    typeof window.PublicKeyCredential === 'function'
  );
}

async function isWebAuthnAutofillSupported(): Promise<boolean> {
  try {
    return isWebAuthnSupported() && window.PublicKeyCredential.isConditionalMediationAvailable();
  } catch (e) {
    return false;
  }
}

async function isWebAuthnPlatformAuthenticatorSupported(): Promise<boolean> {
  try {
    return typeof window !== 'undefined' && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (e) {
    return false;
  }
}

class Base64Converter {
  static encode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  static decode(base64url: string): ArrayBuffer {
    // TODO-PASSKEYS: check if this can be replaced with Buffer.from(base64url, 'base64');
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * Map webauthn errors from `navigator.credentials.create()` to Clerk-js errors
 * @param error
 */
function handlePublicKeyCreateError(error: Error): ClerkRuntimeError | Error {
  if (error.name === 'InvalidStateError') {
    return new ClerkRuntimeError(error.message, { code: 'passkey_exists' });
  } else if (error.name === 'NotAllowedError') {
    return new ClerkRuntimeError(error.message, { code: 'passkey_registration_cancelled' });
  }
  return error;
}

const bufferToBase64Url = Base64Converter.encode.bind(Base64Converter);
const base64UrlToBuffer = Base64Converter.decode.bind(Base64Converter);

export {
  isWebAuthnPlatformAuthenticatorSupported,
  isWebAuthnAutofillSupported,
  isWebAuthnSupported,
  base64UrlToBuffer,
  bufferToBase64Url,
  handlePublicKeyCreateError,
};
