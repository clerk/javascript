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
});

export async function create(
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions,
): Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>> {
  if (!publicKey) {
    throw new Error('No public key found');
  }

  if (!publicKey.rp.id) {
    throw new Error('No RpID not found');
  }

  const rp = { id: publicKey.rp.id, name: publicKey.rp.name };

  const userId = encodeBase64Url(toArrayBuffer(publicKey.user.id));
  const user = {
    id: userId,
    displayName: publicKey.user.displayName,
    name: publicKey.user.name,
  };

  const pubKeyCredParams = publicKey.pubKeyCredParams;
  const challenge = encodeBase64Url(toArrayBuffer(publicKey.challenge));

  const createOptions: SerializedPublicKeyCredentialCreationOptions = {
    rp,
    user,
    pubKeyCredParams,
    challenge,
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

  if (Platform.OS === 'android') {
    const { publicKeyCredential, error } = await AndroidPasskeys.create(createOptions);

    if (error) {
      return {
        publicKeyCredential: null,
        error,
      };
    }

    return {
      publicKeyCredential: makeSerializedCreateResponse(publicKeyCredential),
      error,
    };
  } else if (Platform.OS === 'ios') {
    const { publicKeyCredential, error } = await IOSPasskeys.create(createOptions);
    if (error) {
      return {
        publicKeyCredential: null,
        error,
      };
    }

    return {
      publicKeyCredential: makeSerializedCreateResponse(publicKeyCredential),
      error,
    };
  } else {
    throw new Error('Not supported');
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

  if (Platform.OS === 'android') {
    const { publicKeyCredential, error } = await AndroidPasskeys.get(serializedPublicCredential);

    if (error) {
      return { publicKeyCredential: null, error };
    } else {
      return {
        publicKeyCredential: makeSerializedGetResponse(publicKeyCredential),
        error: null,
      };
    }
  } else if (Platform.OS === 'ios') {
    const { publicKeyCredential, error } = await IOSPasskeys.get(serializedPublicCredential);

    if (error) {
      return { publicKeyCredential: null, error };
    } else {
      return {
        publicKeyCredential: makeSerializedGetResponse(publicKeyCredential),
        error: null,
      };
    }
  } else {
    throw new Error('Not supported');
  }
}

export async function autofill(): Promise<AuthenticationResponseJSON | null> {
  if (Platform.OS === 'android') {
    throw new Error('Not supported');
  } else if (Platform.OS === 'ios') {
    throw new Error('Not supported');
  } else {
    throw new Error('Not supported');
  }
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
