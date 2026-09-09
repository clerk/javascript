import { base64UrlToBuffer } from '@clerk/shared/internal/clerk-js/passkeys';
import type {
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/shared/types';
import { hostRequest } from './host.ts';
import { bridgeError, type JSONValue } from './protocol.ts';

export function binaryToJSON(value: any): JSONValue {
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    const bytes =
      value instanceof ArrayBuffer
        ? new Uint8Array(value)
        : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    return {
      base64url: btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, ''),
    };
  }
  if (Array.isArray(value)) return value.map(binaryToJSON);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([key, v]) => [key, binaryToJSON(v)]),
    );
  return value;
}

function binary(value: unknown): ArrayBuffer {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]*$/.test(value)) throw bridgeError('invalid_credential_result');
  return base64UrlToBuffer(value);
}

export function nativeCredential(
  kind: 'get',
  options: JSONValue,
): Promise<
  | { publicKeyCredential: PublicKeyCredentialWithAuthenticatorAssertionResponse; error: null }
  | { publicKeyCredential: null; error: Error }
>;
export function nativeCredential(
  kind: 'create',
  options: JSONValue,
): Promise<
  | { publicKeyCredential: PublicKeyCredentialWithAuthenticatorAttestationResponse; error: null }
  | { publicKeyCredential: null; error: Error }
>;
export async function nativeCredential(kind: 'get' | 'create', options: JSONValue) {
  try {
    const result = await hostRequest<any>(`passkeys.${kind}`, options);
    if (!result || result.type !== 'public-key' || typeof result.id !== 'string' || !result.response)
      throw bridgeError('invalid_credential_result');
    const response = result.response;
    const credential = {
      id: result.id,
      type: 'public-key',
      authenticatorAttachment: result.authenticatorAttachment ?? null,
      rawId: binary(result.rawId),
      toJSON: () => result,
    };
    if (kind === 'create')
      return {
        publicKeyCredential: {
          ...credential,
          response: {
            clientDataJSON: binary(response.clientDataJSON),
            attestationObject: binary(response.attestationObject),
            getTransports: () =>
              Array.isArray(response.transports)
                ? response.transports.filter((t: unknown) => typeof t === 'string')
                : [],
          },
        },
        error: null,
      };
    return {
      publicKeyCredential: {
        ...credential,
        response: {
          clientDataJSON: binary(response.clientDataJSON),
          authenticatorData: binary(response.authenticatorData),
          signature: binary(response.signature),
          userHandle: response.userHandle == null ? null : binary(response.userHandle),
        },
      },
      error: null,
    };
  } catch (error) {
    return { publicKeyCredential: null, error: error instanceof Error ? error : bridgeError('passkey_failed') };
  }
}
