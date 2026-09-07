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

export function installPasskeyHooks(
  instance: Clerk,
  host: Pick<EmbeddedNativeHost, 'createPublicCredentials' | 'getPublicCredentials'>,
) {
  const clerk = instance as unknown as Record<string, any>;
  (function () {
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
    clerk.__internal_isWebAuthnSupported = function () {
      return true;
    };
    clerk.__internal_isWebAuthnAutofillSupported = function () {
      return Promise.resolve(false);
    };
    clerk.__internal_isWebAuthnPlatformAuthenticatorSupported = function () {
      return Promise.resolve(true);
    };
    clerk.__internal_createPublicCredentials = async function (publicKey: any) {
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
    };
    clerk.__internal_getPublicCredentials = async function (params: any) {
      const publicKeyOptions = params && params.publicKeyOptions;
      if (!publicKeyOptions) {
        throw new Error('publicKeyCredential has not been provided');
      }
      const payload = {
        challenge: bytesToBase64Url(publicKeyOptions.challenge),
        rpId: String(publicKeyOptions.rpId || ''),
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
    };
  })();
}

export function installAppleHooks(instance: Clerk, host: Pick<EmbeddedNativeHost, 'startAppleAuthentication'>) {
  (instance as any).__internal_startAppleAuthentication = (params: unknown) =>
    host.startAppleAuthentication(JSON.stringify(params || {}));
}

export function installBiometricHooks(
  instance: Clerk,
  host: Pick<EmbeddedNativeHost, 'biometricPresence' | 'promptBiometrics'>,
) {
  (instance as any).__internal_biometricPresence = (params: unknown) =>
    host.biometricPresence(JSON.stringify(params || {}));
  (instance as any).__internal_promptBiometrics = (params: unknown) =>
    host.promptBiometrics(JSON.stringify(params || {}));
}

export function installAppAttestHooks(
  instance: Clerk,
  host: Pick<EmbeddedNativeHost, 'prepareDeviceAttestation' | 'prepareDeviceAssertion'>,
) {
  (instance as any).__internal_prepareDeviceAttestation = (params: unknown) =>
    host.prepareDeviceAttestation(JSON.stringify(params || {}));
  (instance as any).__internal_prepareDeviceAssertion = (params: unknown) =>
    host.prepareDeviceAssertion(JSON.stringify(params || {}));
}
