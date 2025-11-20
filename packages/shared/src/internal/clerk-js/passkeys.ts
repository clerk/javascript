import type { ClerkRuntimeError } from '../../error';
import { ClerkWebAuthnError } from '../../error';
import type {
  CredentialReturn,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsJSON,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '../../types';

type WebAuthnCreateCredentialReturn = CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>;
type WebAuthnGetCredentialReturn = CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>;

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
        error: new ClerkWebAuthnError('Browser failed to create credential', {
          code: 'passkey_registration_failed',
        }),
        publicKeyCredential: null,
      };
    }

    return { publicKeyCredential: credential, error: null };
  } catch (e) {
    return { error: handlePublicKeyCreateError(e as Error), publicKeyCredential: null };
  }
}

class WebAuthnAbortService {
  private controller: AbortController | undefined;

  private __abort() {
    if (!this.controller) {
      return;
    }
    const abortError = new Error();
    abortError.name = 'AbortError';
    this.controller.abort(abortError);
  }

  createAbortSignal() {
    this.__abort();
    const newController = new AbortController();
    this.controller = newController;
    return newController.signal;
  }

  abort() {
    this.__abort();
    this.controller = undefined;
  }
}

const __internal_WebAuthnAbortService = new WebAuthnAbortService();

async function webAuthnGetCredential({
  publicKeyOptions,
  conditionalUI,
}: {
  publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
  conditionalUI: boolean;
}): Promise<WebAuthnGetCredentialReturn> {
  try {
    // Typescript types are not aligned with the spec. These type assertions are required to comply with the spec.
    const credential = (await navigator.credentials.get({
      publicKey: publicKeyOptions,
      mediation: conditionalUI ? 'conditional' : 'optional',
      signal: __internal_WebAuthnAbortService.createAbortSignal(),
    })) as PublicKeyCredentialWithAuthenticatorAssertionResponse | null;

    if (!credential) {
      return {
        error: new ClerkWebAuthnError('Browser failed to get credential', { code: 'passkey_retrieval_failed' }),
        publicKeyCredential: null,
      };
    }

    return { publicKeyCredential: credential, error: null };
  } catch (e) {
    return { error: handlePublicKeyGetError(e as Error), publicKeyCredential: null };
  }
}

function handlePublicKeyError(error: Error): ClerkWebAuthnError | ClerkRuntimeError | Error {
  if (error.name === 'AbortError') {
    return new ClerkWebAuthnError(error.message, { code: 'passkey_operation_aborted' });
  }
  if (error.name === 'SecurityError') {
    return new ClerkWebAuthnError(error.message, { code: 'passkey_invalid_rpID_or_domain' });
  }
  return error;
}

/**
 * Map webauthn errors from `navigator.credentials.create()` to Clerk-js errors
 *
 * @param error
 */
function handlePublicKeyCreateError(error: Error): ClerkWebAuthnError | ClerkRuntimeError | Error {
  if (error.name === 'InvalidStateError') {
    // Note: Firefox will throw 'NotAllowedError' when passkeys exists
    return new ClerkWebAuthnError(error.message, { code: 'passkey_already_exists' });
  }
  if (error.name === 'NotAllowedError') {
    return new ClerkWebAuthnError(error.message, { code: 'passkey_registration_cancelled' });
  }
  return handlePublicKeyError(error);
}

/**
 * Map webauthn errors from `navigator.credentials.get()` to Clerk-js errors
 *
 * @param error
 */
function handlePublicKeyGetError(error: Error): ClerkWebAuthnError | ClerkRuntimeError | Error {
  if (error.name === 'NotAllowedError') {
    return new ClerkWebAuthnError(error.message, { code: 'passkey_retrieval_cancelled' });
  }
  return handlePublicKeyError(error);
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
  } as PublicKeyCredentialRequestOptionsWithoutExtensions;
}

function __serializePublicKeyCredential<T extends Omit<PublicKeyCredential, 'getClientExtensionResults'>>(pkc: T) {
  return {
    type: pkc.type,
    id: pkc.id,
    rawId: bufferToBase64Url(pkc.rawId),
    authenticatorAttachment: pkc.authenticatorAttachment,
  };
}

function serializePublicKeyCredential(pkc: PublicKeyCredentialWithAuthenticatorAttestationResponse) {
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

function serializePublicKeyCredentialAssertion(pkc: PublicKeyCredentialWithAuthenticatorAssertionResponse) {
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

export {
  base64UrlToBuffer,
  bufferToBase64Url,
  handlePublicKeyCreateError,
  webAuthnCreateCredential,
  webAuthnGetCredential,
  convertJSONToPublicKeyCreateOptions,
  convertJSONToPublicKeyRequestOptions,
  serializePublicKeyCredential,
  serializePublicKeyCredentialAssertion,
  __internal_WebAuthnAbortService,
};
