import { isValidBrowser } from '@clerk/shared/browser';
import { ClerkRuntimeError } from '@clerk/shared/error';
import type {
  __experimental_PublicKeyCredentialCreationOptionsWithoutExtensions,
  __experimental_PublicKeyCredentialRequestOptionsWithoutExtensions,
  __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse,
  __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@clerk/types';

type CredentialReturn<T> =
  | {
      publicKeyCredential: T;
      error: null;
    }
  | {
      publicKeyCredential: null;
      error: ClerkWebAuthnError | Error;
    };

type WebAuthnCreateCredentialReturn =
  CredentialReturn<__experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse>;
type WebAuthnGetCredentialReturn =
  CredentialReturn<__experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse>;

type ClerkWebAuthnErrorCode =
  | 'passkey_exists'
  | 'passkey_registration_cancelled'
  | 'passkey_credential_create_failed'
  | 'passkey_credential_get_failed';

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
  publicKeyOptions: __experimental_PublicKeyCredentialCreationOptionsWithoutExtensions,
): Promise<WebAuthnCreateCredentialReturn> {
  try {
    // Typescript types are not aligned with the spec. These type assertions are required to comply with the spec.
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse | null;

    if (!credential) {
      return {
        error: new ClerkWebAuthnError('Browser failed to create credential', {
          code: 'passkey_credential_create_failed',
        }),
        publicKeyCredential: null,
      };
    }

    return { publicKeyCredential: credential, error: null };
  } catch (e) {
    return { error: handlePublicKeyCreateError(e), publicKeyCredential: null };
  }
}

async function webAuthnGetCredential({
  publicKeyOptions,
  conditionalUI,
}: {
  publicKeyOptions: __experimental_PublicKeyCredentialRequestOptionsWithoutExtensions;
  conditionalUI: boolean;
}): Promise<WebAuthnGetCredentialReturn> {
  try {
    // Typescript types are not aligned with the spec. These type assertions are required to comply with the spec.
    const credential = (await navigator.credentials.get({
      publicKey: publicKeyOptions,
      mediation: conditionalUI ? 'conditional' : 'optional',
    })) as __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse | null;

    if (!credential) {
      return {
        error: new ClerkWebAuthnError('Browser failed to get credential', { code: 'passkey_credential_get_failed' }),
        publicKeyCredential: null,
      };
    }

    return { publicKeyCredential: credential, error: null };
  } catch (e) {
    return { error: handlePublicKeyGetError(e), publicKeyCredential: null };
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

/**
 * Map webauthn errors from `navigator.credentials.get()` to Clerk-js errors
 * @param error
 */
function handlePublicKeyGetError(error: Error): ClerkWebAuthnError | ClerkRuntimeError | Error {
  if (error.name === 'NotAllowedError') {
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
  } as __experimental_PublicKeyCredentialCreationOptionsWithoutExtensions;
}

function convertJSONToPublicKeyRequestOptions(jsonPublicKey: PublicKeyCredentialRequestOptionsJSON) {
  const challengeBuffer = base64UrlToBuffer(jsonPublicKey.challenge);

  const allowCredentialsWithBuffer = (jsonPublicKey.allowCredentials || []).map(cred => ({
    ...cred,
    id: base64UrlToBuffer(cred.id),
  }));

  return {
    ...jsonPublicKey,
    allowCredentials: allowCredentialsWithBuffer,
    challenge: challengeBuffer,
  } as __experimental_PublicKeyCredentialRequestOptionsWithoutExtensions;
}

function __serializePublicKeyCredential<T extends Omit<PublicKeyCredential, 'getClientExtensionResults'>>(pkc: T) {
  return {
    type: pkc.type,
    id: pkc.id,
    rawId: bufferToBase64Url(pkc.rawId),
    authenticatorAttachment: pkc.authenticatorAttachment,
  };
}

function serializePublicKeyCredential(pkc: __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse) {
  const response = pkc.response;
  return {
    ...__serializePublicKeyCredential(pkc),
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports: response.getTransports(),
    },
  };
}

function serializePublicKeyCredentialAssertion(
  pkc: __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse,
) {
  const response = pkc.response;
  return {
    ...__serializePublicKeyCredential(pkc),
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
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
  webAuthnGetCredential,
  convertJSONToPublicKeyCreateOptions,
  convertJSONToPublicKeyRequestOptions,
  serializePublicKeyCredential,
  serializePublicKeyCredentialAssertion,
};
