import { isValidBrowser } from '@clerk/shared/browser';
import { ClerkRuntimeError } from '@clerk/shared/error';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
} from '@clerk/types';

type PublicKeyCredentialWithAuthenticatorAttestationResponse = Omit<
  PublicKeyCredential,
  'response' | 'getClientExtensionResults'
> & {
  response: Omit<AuthenticatorAttestationResponse, 'getAuthenticatorData' | 'getPublicKey' | 'getPublicKeyAlgorithm'>;
};

type WebAuthnCreateCredentialReturn =
  | {
      publicKeyCredential: PublicKeyCredentialWithAuthenticatorAttestationResponse;
      error: null;
    }
  | {
      publicKeyCredential: null;
      error: ClerkWebAuthnError | Error;
    };

type ClerkWebAuthnErrorCode = 'passkey_exists' | 'passkey_registration_cancelled' | 'passkey_credential_failed';

function isWebAuthnSupported() {
  return (
    isValidBrowser() &&
    // Check if `PublicKeyCredential` is a constructor
    typeof window.PublicKeyCredential === 'function'
  );
}

async function isWebAuthnAutofillSupported(): Promise<boolean> {
  try {
    return isWebAuthnSupported() && (await window.PublicKeyCredential.isConditionalMediationAvailable());
  } catch (e) {
    return false;
  }
}

async function isWebAuthnPlatformAuthenticatorSupported(): Promise<boolean> {
  try {
    return (
      typeof window !== 'undefined' &&
      (await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
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

async function webAuthnCreateCredential(
  publicKeyOptions: PublicKeyCredentialCreationOptionsWithoutExtensions,
): Promise<WebAuthnCreateCredentialReturn> {
  try {
    // Typescript types are not aligned with the spec. These type assertions are required to comply with the spec.
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredentialWithAuthenticatorAttestationResponse | null;

    if (!credential) {
      return {
        error: new ClerkWebAuthnError('Browser failed to create credential', { code: 'passkey_credential_failed' }),
        publicKeyCredential: null,
      };
    }

    return { publicKeyCredential: credential, error: null };
  } catch (e) {
    return { error: handlePublicKeyCreateError(e), publicKeyCredential: null };
  }
}

/**
 * Map webauthn errors from `navigator.credentials.create()` to Clerk-js errors
 * @param error
 */
function handlePublicKeyCreateError(error: Error): ClerkWebAuthnError | ClerkRuntimeError | Error {
  if (error.name === 'InvalidStateError') {
    return new ClerkWebAuthnError(error.message, { code: 'passkey_exists' });
  } else if (error.name === 'NotAllowedError') {
    return new ClerkWebAuthnError(error.message, { code: 'passkey_registration_cancelled' });
  }
  return error;
}

function convertJSONToPublicKeyCreateOptions(jsonPublicKey: PublicKeyCredentialCreationOptionsJSON) {
  const userIdBuffer = base64UrlToBuffer(jsonPublicKey.user.id);
  const challengeBuffer = base64UrlToBuffer(jsonPublicKey.challenge);

  const excludeCredentialsWithBuffer = (jsonPublicKey.excludeCredentials || []).map(cred => ({
    ...cred,
    id: base64UrlToBuffer(cred.id),
  }));

  return {
    ...jsonPublicKey,
    excludeCredentials: excludeCredentialsWithBuffer,
    challenge: challengeBuffer,
    user: {
      ...jsonPublicKey.user,
      id: userIdBuffer,
    },
  } as PublicKeyCredentialCreationOptionsWithoutExtensions;
}

function serializePublicKeyCredential(publicKeyCredential: PublicKeyCredentialWithAuthenticatorAttestationResponse) {
  const response = publicKeyCredential.response;
  return {
    type: publicKeyCredential.type,
    id: publicKeyCredential.id,
    rawId: bufferToBase64Url(publicKeyCredential.rawId),
    authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports: response.getTransports(),
    },
  };
}

const bufferToBase64Url = Base64Converter.encode.bind(Base64Converter);
const base64UrlToBuffer = Base64Converter.decode.bind(Base64Converter);

export class ClerkWebAuthnError extends ClerkRuntimeError {
  /**
   * A unique code identifying the error, can be used for localization.
   */
  code: ClerkWebAuthnErrorCode;

  constructor(message: string, { code }: { code: ClerkWebAuthnErrorCode }) {
    super(message, { code });
    this.code = code;
  }
}

export {
  isWebAuthnPlatformAuthenticatorSupported,
  isWebAuthnAutofillSupported,
  isWebAuthnSupported,
  base64UrlToBuffer,
  bufferToBase64Url,
  handlePublicKeyCreateError,
  webAuthnCreateCredential,
  convertJSONToPublicKeyCreateOptions,
  serializePublicKeyCredential,
};

export type { PublicKeyCredentialWithAuthenticatorAttestationResponse };
