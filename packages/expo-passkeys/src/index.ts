import { Platform } from 'react-native';

import type {
  AuthenticationResponseJSON,
  CredentialReturn,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
  RegistrationResponseJSON,
  SerializedPublicKeyCredentialCreationOptions,
  SerializedPublicKeyCredentialRequestOptions,
} from './ClerkExpoPasskeys.types';
import ClerkExpoPasskeys from './ClerkExpoPasskeysModule';
import {
  arrayBufferToBase64Url,
  base64urlToArrayBuffer,
  ClerkWebAuthnError,
  encodeBase64Url,
  mapNativeErrorToClerkWebAuthnErrorCode,
  toArrayBuffer,
} from './utils';

const makeSerializedCreateResponse = (
  publicCredential: RegistrationResponseJSON,
): PublicKeyCredentialWithAuthenticatorAttestationResponse => ({
  id: publicCredential.id,
  rawId: base64urlToArrayBuffer(publicCredential.rawId),
  response: {
    getTransports: () => publicCredential?.response?.transports as string[],
    attestationObject: base64urlToArrayBuffer(publicCredential.response.attestationObject),
    clientDataJSON: base64urlToArrayBuffer(publicCredential.response.clientDataJSON),
  },
  type: publicCredential.type,
  authenticatorAttachment: publicCredential.authenticatorAttachment || null,
  toJSON: () => publicCredential,
});

export async function create(
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions,
): Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>> {
  if (!publicKey || !publicKey.rp.id) {
    throw new Error('Invalid public key or RpID');
  }

  const createOptions: SerializedPublicKeyCredentialCreationOptions = {
    rp: { id: publicKey.rp.id, name: publicKey.rp.name },
    user: {
      id: encodeBase64Url(toArrayBuffer(publicKey.user.id)),
      displayName: publicKey.user.displayName,
      name: publicKey.user.name,
    },
    pubKeyCredParams: publicKey.pubKeyCredParams,
    challenge: encodeBase64Url(toArrayBuffer(publicKey.challenge)),
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      residentKey: 'required',
      userVerification: 'required',
    },
    excludeCredentials: publicKey.excludeCredentials.map(c => ({
      type: 'public-key',
      id: encodeBase64Url(toArrayBuffer(c.id)),
    })),
  };

  const createPasskeyModule = Platform.select({
    android: async () => ClerkExpoPasskeys.create(JSON.stringify(createOptions)),
    ios: async () =>
      ClerkExpoPasskeys.create(
        createOptions.challenge,
        createOptions.rp.id,
        createOptions.user.id,
        createOptions.user.displayName,
      ),
    default: null,
  });

  if (!createPasskeyModule) {
    throw new Error('Platform not supported');
  }

  try {
    const response = await createPasskeyModule();
    return {
      publicKeyCredential: makeSerializedCreateResponse(typeof response === 'string' ? JSON.parse(response) : response),
      error: null,
    };
  } catch (error) {
    return {
      publicKeyCredential: null,
      error: mapNativeErrorToClerkWebAuthnErrorCode(error.code, error.message, 'create'),
    };
  }
}

const makeSerializedGetResponse = (
  publicKeyCredential: AuthenticationResponseJSON,
): PublicKeyCredentialWithAuthenticatorAssertionResponse => {
  return {
    type: publicKeyCredential.type,
    id: publicKeyCredential.id,
    rawId: base64urlToArrayBuffer(publicKeyCredential.rawId),
    authenticatorAttachment: publicKeyCredential?.authenticatorAttachment || null,
    response: {
      clientDataJSON: base64urlToArrayBuffer(publicKeyCredential.response.clientDataJSON),
      authenticatorData: base64urlToArrayBuffer(publicKeyCredential.response.authenticatorData),
      signature: base64urlToArrayBuffer(publicKeyCredential.response.signature),
      userHandle: publicKeyCredential?.response.userHandle
        ? base64urlToArrayBuffer(publicKeyCredential?.response.userHandle)
        : null,
    },
    toJSON: () => publicKeyCredential,
  };
};

export async function get({
  publicKeyOptions,
}: {
  publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
}): Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>> {
  if (!publicKeyOptions) {
    throw new Error('publicKeyCredential has not been provided');
  }

  const serializedPublicCredential: SerializedPublicKeyCredentialRequestOptions = {
    ...publicKeyOptions,
    challenge: arrayBufferToBase64Url(publicKeyOptions.challenge),
  };

  const getPasskeyModule = Platform.select({
    android: async () => ClerkExpoPasskeys.get(JSON.stringify(serializedPublicCredential)),
    ios: async () => ClerkExpoPasskeys.get(serializedPublicCredential.challenge, serializedPublicCredential.rpId),
    default: null,
  });

  if (!getPasskeyModule) {
    return {
      publicKeyCredential: null,
      error: new ClerkWebAuthnError('Platform is not supported', { code: 'passkey_not_supported' }),
    };
  }

  try {
    const response = await getPasskeyModule();
    return {
      publicKeyCredential: makeSerializedGetResponse(typeof response === 'string' ? JSON.parse(response) : response),
      error: null,
    };
  } catch (error) {
    return {
      publicKeyCredential: null,
      error: mapNativeErrorToClerkWebAuthnErrorCode(error.code, error.message, 'get'),
    };
  }
}

const ANDROID_9 = 28;
const IOS_15 = 15;

export function isSupported() {
  if (Platform.OS === 'android') {
    return Platform.Version >= ANDROID_9;
  }

  if (Platform.OS === 'ios') {
    return parseInt(Platform.Version, 10) > IOS_15;
  }

  return false;
}

// FIX:The autofill function has been implemented for iOS only, but the pop-up is not showing up.
// This seems to be an issue with Expo that we haven't been able to resolve yet.
// Further investigation and possibly reaching out to Expo support may be necessary.

// async function autofill(): Promise<AuthenticationResponseJSON | null> {
//   if (Platform.OS === 'android') {
//     throw new Error('Not supported');
//   } else if (Platform.OS === 'ios') {
//     throw new Error('Not supported');
//   } else {
//     throw new Error('Not supported');
//   }
// }

export const passkeys = {
  create,
  get,
  isSupported,
  isAutoFillSupported: () => {
    throw new Error('Not supported');
  },
};
