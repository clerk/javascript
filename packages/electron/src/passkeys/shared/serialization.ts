import { base64UrlToBuffer, bufferToBase64Url } from '@clerk/shared/internal/clerk-js/passkeys';
import type {
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/shared/types';

import type {
  AuthenticationResponseJSON,
  AuthenticatorTransport,
  RegistrationResponseJSON,
  SerializedPublicKeyCredentialCreationOptions,
  SerializedPublicKeyCredentialRequestOptions,
} from '../../shared/types';

function toArrayBuffer(bufferSource: BufferSource): ArrayBuffer {
  if (bufferSource instanceof ArrayBuffer) {
    return bufferSource;
  }
  // Copy the view into a fresh ArrayBuffer; .buffer may be a SharedArrayBuffer.
  const view = new Uint8Array(bufferSource.buffer, bufferSource.byteOffset, bufferSource.byteLength);
  const copy = new ArrayBuffer(view.byteLength);
  new Uint8Array(copy).set(view);
  return copy;
}

const encode = (bufferSource: BufferSource) => bufferToBase64Url(toArrayBuffer(bufferSource));

export function serializeCreationOptions(
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions,
): SerializedPublicKeyCredentialCreationOptions {
  return {
    rp: { id: publicKey.rp.id ?? '', name: publicKey.rp.name },
    user: {
      id: encode(publicKey.user.id),
      displayName: publicKey.user.displayName,
      name: publicKey.user.name,
    },
    challenge: encode(publicKey.challenge),
    pubKeyCredParams: publicKey.pubKeyCredParams.map(p => ({ type: 'public-key', alg: p.alg })),
    timeout: publicKey.timeout,
    authenticatorSelection: publicKey.authenticatorSelection,
    attestation: publicKey.attestation,
    excludeCredentials: (publicKey.excludeCredentials ?? []).map(c => ({
      type: 'public-key',
      id: encode(c.id),
      transports: c.transports as AuthenticatorTransport[] | undefined,
    })),
  };
}

export function serializeRequestOptions(
  publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions,
): SerializedPublicKeyCredentialRequestOptions {
  return {
    challenge: encode(publicKeyOptions.challenge),
    rpId: publicKeyOptions.rpId ?? '',
    timeout: publicKeyOptions.timeout,
    userVerification: publicKeyOptions.userVerification,
    allowCredentials: (publicKeyOptions.allowCredentials ?? []).map(c => ({
      type: 'public-key',
      id: encode(c.id),
    })),
  };
}

export function deserializeCreationResponse(
  credential: RegistrationResponseJSON,
): PublicKeyCredentialWithAuthenticatorAttestationResponse & { toJSON: () => RegistrationResponseJSON } {
  return {
    id: credential.id,
    rawId: base64UrlToBuffer(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? null,
    response: {
      clientDataJSON: base64UrlToBuffer(credential.response.clientDataJSON),
      attestationObject: base64UrlToBuffer(credential.response.attestationObject),
      getTransports: () => credential.response.transports ?? [],
    },
    toJSON: () => credential,
  } as PublicKeyCredentialWithAuthenticatorAttestationResponse & { toJSON: () => RegistrationResponseJSON };
}

export function deserializeRequestResponse(
  credential: AuthenticationResponseJSON,
): PublicKeyCredentialWithAuthenticatorAssertionResponse & { toJSON: () => AuthenticationResponseJSON } {
  return {
    id: credential.id,
    rawId: base64UrlToBuffer(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? null,
    response: {
      clientDataJSON: base64UrlToBuffer(credential.response.clientDataJSON),
      authenticatorData: base64UrlToBuffer(credential.response.authenticatorData),
      signature: base64UrlToBuffer(credential.response.signature),
      userHandle: credential.response.userHandle ? base64UrlToBuffer(credential.response.userHandle) : null,
    },
    toJSON: () => credential,
  } as PublicKeyCredentialWithAuthenticatorAssertionResponse & { toJSON: () => AuthenticationResponseJSON };
}
