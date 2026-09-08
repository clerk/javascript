import type { Clerk } from '../core/clerk';

export interface EmbeddedNativeHost {
  createPublicCredentials(payload: string): Promise<any>;
  getPublicCredentials(payload: string): Promise<any>;
  startAppleAuthentication(payload: string): Promise<any>;
  biometricPresence(payload: string): Promise<any>;
  promptBiometrics(payload: string): Promise<any>;
  prepareDeviceAttestation(payload: string): Promise<any>;
  prepareDeviceAssertion(payload: string): Promise<any>;
}

function installHooks(instance: Clerk, hooks: Record<string, (...args: never[]) => unknown>) {
  const restore = Object.entries(hooks).map(([name, hook]) => {
    const previous: unknown = Reflect.get(instance, name);
    Reflect.set(instance, name, hook);
    return () => {
      if (Reflect.get(instance, name) === hook) {
        Reflect.set(instance, name, previous);
      }
    };
  });
  return () => restore.forEach(reset => reset());
}

export function installPasskeyHooks(
  instance: Clerk,
  host: Pick<EmbeddedNativeHost, 'createPublicCredentials' | 'getPublicCredentials'>,
) {
  function bytesToBase64Url(value: any) {
    if (value == null) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    let bytes;
    if (value instanceof ArrayBuffer) {
      bytes = new Uint8Array(value);
    } else if (value.buffer instanceof ArrayBuffer) {
      bytes = new Uint8Array(value.buffer, value.byteOffset || 0, value.byteLength || value.length);
    } else if (typeof value.length === 'number') {
      bytes = new Uint8Array(value);
    } else {
      return '';
    }
    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  function base64UrlToBytes(value: any) {
    let base64 = String(value || '')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '===='.slice(0, 4 - pad);
    }
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
  }
  function passkeyError(error: any, fallbackCode: string) {
    const err = new Error(error && error.message ? String(error.message) : String(error));
    err.name = (error && error.name) || 'ClerkWebAuthnError';
    (err as Error & { code: string }).code = error && error.code ? String(error.code) : fallbackCode;
    return err;
  }
  return installHooks(instance, {
    __internal_isWebAuthnSupported() {
      return true;
    },
    __internal_isWebAuthnAutofillSupported() {
      return Promise.resolve(false);
    },
    __internal_isWebAuthnPlatformAuthenticatorSupported() {
      return Promise.resolve(true);
    },
    async __internal_createPublicCredentials(publicKey: any) {
      if (!publicKey || !publicKey.rp || !publicKey.rp.id) {
        throw new Error('Invalid public key or RpID');
      }
      const payload = {
        challenge: bytesToBase64Url(publicKey.challenge),
        rpId: String(publicKey.rp.id),
        userId: bytesToBase64Url(publicKey.user && publicKey.user.id),
        displayName: String((publicKey.user && (publicKey.user.displayName || publicKey.user.name)) || ''),
        excludeCredentials: (publicKey.excludeCredentials || []).map(function (credential: any) {
          return bytesToBase64Url(credential.id);
        }),
      };
      try {
        const credential = await host.createPublicCredentials(JSON.stringify(payload));
        return {
          publicKeyCredential: {
            id: credential.id,
            rawId: base64UrlToBytes(credential.rawId),
            type: credential.type || 'public-key',
            authenticatorAttachment: credential.authenticatorAttachment || 'platform',
            response: {
              clientDataJSON: base64UrlToBytes(credential.response.clientDataJSON),
              attestationObject: base64UrlToBytes(credential.response.attestationObject),
              getTransports: function () {
                return credential.response.transports || ['internal'];
              },
            },
          },
          error: null,
        };
      } catch (error) {
        return { publicKeyCredential: null, error: passkeyError(error, 'passkey_registration_failed') };
      }
    },
    async __internal_getPublicCredentials(params: any) {
      const publicKeyOptions = params && params.publicKeyOptions;
      if (!publicKeyOptions) {
        throw new Error('publicKeyCredential has not been provided');
      }
      const payload = {
        challenge: bytesToBase64Url(publicKeyOptions.challenge),
        rpId: String(publicKeyOptions.rpId || ''),
        conditionalUI: params.conditionalUI === true,
        preferImmediatelyAvailableCredentials: params.preferImmediatelyAvailableCredentials !== false,
        allowCredentials: (publicKeyOptions.allowCredentials || []).map(function (credential: any) {
          return bytesToBase64Url(credential.id);
        }),
      };
      if (!payload.rpId) {
        throw new Error('Invalid public key or RpID');
      }
      try {
        const credential = await host.getPublicCredentials(JSON.stringify(payload));
        return {
          publicKeyCredential: {
            id: credential.id,
            rawId: base64UrlToBytes(credential.rawId),
            type: credential.type || 'public-key',
            authenticatorAttachment: credential.authenticatorAttachment || 'platform',
            response: {
              clientDataJSON: base64UrlToBytes(credential.response.clientDataJSON),
              authenticatorData: base64UrlToBytes(credential.response.authenticatorData),
              signature: base64UrlToBytes(credential.response.signature),
              userHandle: credential.response.userHandle ? base64UrlToBytes(credential.response.userHandle) : null,
            },
          },
          error: null,
        };
      } catch (error) {
        return { publicKeyCredential: null, error: passkeyError(error, 'passkey_retrieval_failed') };
      }
    },
  });
}

export function installAppleHooks(instance: Clerk, host: Pick<EmbeddedNativeHost, 'startAppleAuthentication'>) {
  return installHooks(instance, {
    __internal_startAppleAuthentication: (params: unknown) =>
      host.startAppleAuthentication(JSON.stringify(params || {})),
  });
}

export function installBiometricHooks(
  instance: Clerk,
  host: Pick<EmbeddedNativeHost, 'biometricPresence' | 'promptBiometrics'>,
) {
  return installHooks(instance, {
    __internal_biometricPresence: (params: unknown) => host.biometricPresence(JSON.stringify(params || {})),
    __internal_promptBiometrics: (params: unknown) => host.promptBiometrics(JSON.stringify(params || {})),
  });
}

export function installAppAttestHooks(
  instance: Clerk,
  host: Pick<EmbeddedNativeHost, 'prepareDeviceAttestation' | 'prepareDeviceAssertion'>,
) {
  return installHooks(instance, {
    __internal_prepareDeviceAttestation: (params: unknown) =>
      host.prepareDeviceAttestation(JSON.stringify(params || {})),
    __internal_prepareDeviceAssertion: (params: unknown) => host.prepareDeviceAssertion(JSON.stringify(params || {})),
  });
}
