import { ClerkRuntimeError } from '@clerk/shared/error';
import { Buffer } from 'buffer';

export function encodeBase64(data: ArrayLike<number> | ArrayBufferLike) {
  return btoa(String.fromCharCode(...new Uint8Array(data)));
}

export function encodeBase64Url(data: ArrayLike<number> | ArrayBufferLike) {
  return encodeBase64(data).replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
}

export function decodeBase64Url(data: string) {
  return decodeBase64(data.replaceAll('-', '+').replaceAll('_', '/'));
}

export function decodeToken(data: string) {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
  return JSON.parse(jsonPayload);
}

export function decodeBase64(data: string) {
  return Uint8Array.from(atob(data).split(''), x => x.charCodeAt(0));
}

export function utf8Decode(buffer: BufferSource) {
  const textDecoder = new TextDecoder();
  return textDecoder.decode(buffer);
}

export function toArrayBuffer(bufferSource: BufferSource) {
  if (bufferSource instanceof ArrayBuffer) {
    return bufferSource; // It's already an ArrayBuffer
  } else if (ArrayBuffer.isView(bufferSource)) {
    return bufferSource.buffer; // Extract the ArrayBuffer from the typed array
  } else {
    throw new TypeError('Expected a BufferSource, but received an incompatible type.');
  }
}

export function base64urlToArrayBuffer(base64url: string) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

  const binaryString = Buffer.from(base64, 'base64').toString('binary');

  const len = binaryString.length;
  const buffer = new ArrayBuffer(len);
  const uintArray = new Uint8Array(buffer);

  for (let i = 0; i < len; i++) {
    uintArray[i] = binaryString.charCodeAt(i);
  }

  return buffer;
}

export function arrayBufferToBase64Url(buffer) {
  // Convert ArrayBuffer to a byte array
  const bytes = new Uint8Array(buffer);
  let binary = '';

  // Convert each byte to a binary string
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Base64 encode the binary string
  const base64String = btoa(binary);

  // Convert to Base64URL by replacing characters
  const base64Url = base64String
    .replace(/\+/g, '-') // Replace + with -
    .replace(/\//g, '_') // Replace / with _
    .replace(/=+$/, ''); // Remove padding (equal signs)

  return base64Url;
}

type ClerkWebAuthnErrorCode =
  // Generic
  | 'passkey_not_supported'
  | 'passkey_pa_not_supported'
  | 'passkey_invalid_rpID_or_domain'
  | 'passkey_already_exists'
  | 'passkey_operation_aborted'
  // Retrieval
  | 'passkey_retrieval_cancelled'
  | 'passkey_retrieval_failed'
  // Registration
  | 'passkey_registration_cancelled'
  | 'passkey_registration_failed';

//TODO THIS NEEDS TO BE IMPORTED FROM JS FILE. We need to first export it from there though.
export class ClerkWebAuthnError extends ClerkRuntimeError {
  code: ClerkWebAuthnErrorCode;

  constructor(message: string, { code }: { code: ClerkWebAuthnErrorCode }) {
    super(message, { code });
    this.code = code;
  }
}

export function mapNativeErrorToClerkWebAuthnErrorCode(
  code: string,
  message: string,
  action: 'get' | 'create',
): ClerkWebAuthnError {
  if (code === '1000' || code === '1004' || code === 'CreatePublicKeyCredentialDomException') {
    return new ClerkWebAuthnError(message, {
      code: action === 'create' ? 'passkey_registration_failed' : 'passkey_retrieval_failed',
    });
  }
  if (
    code === '1001' ||
    code === 'CreateCredentialCancellationException' ||
    code === 'GetCredentialCancellationException'
  ) {
    return new ClerkWebAuthnError(message, { code: 'passkey_registration_cancelled' });
  }

  if (code === '1002') {
    return new ClerkWebAuthnError(message, { code: 'passkey_invalid_rpID_or_domain' });
  }

  if (code === '1003' || code === 'CreateCredentialInterruptedException') {
    return new ClerkWebAuthnError(message, { code: 'passkey_operation_aborted' });
  }

  return new ClerkWebAuthnError(message, {
    code: action === 'create' ? 'passkey_registration_failed' : 'passkey_retrieval_failed',
  });
}
