import { ClerkWebAuthnError } from '@clerk/shared/error';
import type {
  CredentialReturn,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/shared/types';

import type { PasskeyBridge } from '../../shared/types';
import { mapPasskeyIpcError } from '../shared/errors';
import {
  deserializeCreationResponse,
  deserializeRequestResponse,
  serializeCreationOptions,
  serializeRequestOptions,
} from '../shared/serialization';

export function getPasskeyBridge(): PasskeyBridge | undefined {
  return typeof window !== 'undefined' ? window.__clerk_internal_electron_passkeys : undefined;
}

const bridgeMissingError = () =>
  new ClerkWebAuthnError(
    'Clerk: The native passkey bridge is not available. Call setupPasskeysPreload() in your preload script and setupPasskeysMain() in the main process.',
    { code: 'passkey_not_supported' },
  );

export async function nativeCreateCredential(
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions,
): Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>> {
  const bridge = getPasskeyBridge();
  if (!bridge) {
    return { publicKeyCredential: null, error: bridgeMissingError() };
  }

  const result = await bridge.create(serializeCreationOptions(publicKey));
  if (!result.ok) {
    return { publicKeyCredential: null, error: mapPasskeyIpcError(result.error, 'create') };
  }
  return { publicKeyCredential: deserializeCreationResponse(result.credential), error: null };
}

export async function nativeGetCredential(
  publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions,
): Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>> {
  const bridge = getPasskeyBridge();
  if (!bridge) {
    return { publicKeyCredential: null, error: bridgeMissingError() };
  }

  const result = await bridge.get(serializeRequestOptions(publicKeyOptions));
  if (!result.ok) {
    return { publicKeyCredential: null, error: mapPasskeyIpcError(result.error, 'get') };
  }
  return { publicKeyCredential: deserializeRequestResponse(result.credential), error: null };
}
