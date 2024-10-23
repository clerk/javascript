import { Platform } from 'react-native';

import { AndroidPasskeys } from './AndroidPasskeys';
import {
  AuthenticationResponseJSON,
  SerializedPublicKeyCredentialCreationOptions,
  SerializedPublicKeyCredentialRequestOptions,
  RegistrationResponseJSON,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  CredentialReturn,
} from './ClerkExpoPasskeys.types';
import { IOSPasskeys } from './IOSPasskeys';
import { arrayBufferToBase64Url, base64urlToArrayBuffer, encodeBase64Url, toArrayBuffer } from './utils';

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

  const passkeyModule = Platform.select({
    android: AndroidPasskeys,
    ios: IOSPasskeys,
    default: null,
  });

  if (!passkeyModule) {
    throw new Error('Platform not supported');
  }

  const { publicKeyCredential, error } = await passkeyModule.create(createOptions);

  return error
    ? { publicKeyCredential: null, error }
    : { publicKeyCredential: makeSerializedCreateResponse(publicKeyCredential), error: null };
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

export async function get(
  publicKeyCredential: PublicKeyCredentialRequestOptionsWithoutExtensions,
): Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>> {
  if (!publicKeyCredential) {
    throw new Error('publicKeyCredential has not been provided');
  }

  const serializedPublicCredential: SerializedPublicKeyCredentialRequestOptions = {
    ...publicKeyCredential,
    challenge: arrayBufferToBase64Url(publicKeyCredential.challenge),
  };

  const passkeyModule = Platform.select({
    android: AndroidPasskeys,
    ios: IOSPasskeys,
    default: null,
  });

  if (!passkeyModule) {
    throw new Error('Platform not supported');
  }

  const { publicKeyCredential: result, error } = await passkeyModule.get(serializedPublicCredential);

  return error
    ? { publicKeyCredential: null, error }
    : { publicKeyCredential: makeSerializedGetResponse(result), error: null };
}

export function isSupported() {
  if (Platform.OS === 'android') {
    return Platform.Version > 28;
  }

  if (Platform.OS === 'ios') {
    return parseInt(Platform.Version, 10) > 15;
  }

  return false;
}

// FIX:The autofill function has been implemented for iOS only, but the pop-up is not showing up.
// This seems to be an issue with Expo that we haven't been able to resolve yet.
// Further investigation and possibly reaching out to Expo support may be necessary.

export async function autofill(): Promise<AuthenticationResponseJSON | null> {
  if (Platform.OS === 'android') {
    throw new Error('Not supported');
  } else if (Platform.OS === 'ios') {
    throw new Error('Not supported');
  } else {
    throw new Error('Not supported');
  }
}

export const passkeys = {
  create,
  get,
  isSupported,
};
