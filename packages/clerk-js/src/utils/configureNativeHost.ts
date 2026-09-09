import { ClerkRuntimeError } from '@clerk/shared/error';
import type { MobileNativeHost } from '@clerk/shared/mobile';

import type { Clerk } from '../core/clerk';
import { NativeBiometricCredentials, type NativeBiometricHost } from './NativeBiometricCredentials';
import { NativeMagicLink } from './NativeMagicLink';
import { binaryToJSON, nativeCredential } from './nativeCredentials';

/** Installs OS effects on a Clerk owner. It does not own HTTP, resource state, or client persistence. */
export function configureNativeHost(clerk: Clerk, host: MobileNativeHost) {
  const callback = new URL(host.callbackUrl);
  if (
    ['http:', 'javascript:', 'data:', 'file:', 'about:'].includes(callback.protocol) ||
    callback.username ||
    callback.password ||
    callback.hash
  )
    throw new ClerkRuntimeError('Invalid native authentication callback URL.', { code: 'invalid_callback_url' });
  let disposed = false;
  const supports = (capability: string) => !disposed && host.capabilities.includes(capability);
  const request: MobileNativeHost['request'] = (capability, args) =>
    disposed
      ? Promise.reject(new ClerkRuntimeError('The native host is unavailable.', { code: 'native_host_unavailable' }))
      : host.request(capability, args);
  const unavailable = () =>
    Promise.reject(new ClerkRuntimeError('This native capability is unavailable.', { code: 'capability_unavailable' }));
  const previous = {
    __internal_getGoogleIdentity: clerk.__internal_getGoogleIdentity,
    __internal_getAppleIdentity: clerk.__internal_getAppleIdentity,
    __internal_nativeMagicLink: clerk.__internal_nativeMagicLink,
    __internal_nativeBiometrics: clerk.__internal_nativeBiometrics,
    __internal_isWebAuthnSupported: clerk.__internal_isWebAuthnSupported,
    __internal_isWebAuthnAutofillSupported: clerk.__internal_isWebAuthnAutofillSupported,
    __internal_isWebAuthnPlatformAuthenticatorSupported: clerk.__internal_isWebAuthnPlatformAuthenticatorSupported,
    __internal_createPublicCredentials: clerk.__internal_createPublicCredentials,
    __internal_getPublicCredentials: clerk.__internal_getPublicCredentials,
    __internal_beforeNativeAuthReset: clerk.__internal_beforeNativeAuthReset,
  };
  const scope = clerk.publishableKey;
  clerk.__internal_getGoogleIdentity = supports('googleIdentity')
    ? options => request('googleIdentity', options)
    : undefined;
  clerk.__internal_getAppleIdentity = options =>
    supports('appleIdentity') ? request('appleIdentity', options) : unavailable();
  const authStorageArgs = { scope, key: 'magicLink' };
  const magicLink = new NativeMagicLink(
    clerk,
    host.callbackUrl,
    supports('authStorage')
      ? {
          read: () => request('authStorage.read', authStorageArgs),
          write: value => request('authStorage.write', { ...authStorageArgs, value }),
          remove: () => request('authStorage.remove', authStorageArgs),
        }
      : undefined,
    value => (supports('crypto.sha256') ? request('crypto.sha256', { value }) : unavailable()),
    supports('magicLink.attestation') ? () => request('magicLink.attestation', {}) : undefined,
  );
  clerk.__internal_nativeMagicLink = magicLink;
  const storage = (key: string) => ({
    read: (): Promise<string | null> => request('biometrics.storage.read', { scope, key }),
    write: (value: string): Promise<void> => request('biometrics.storage.write', { scope, key, value }),
  });
  const biometricHost: NativeBiometricHost | undefined = supports('biometrics')
    ? {
        platform: host.platform,
        appIdentifier: () => request('biometrics.appIdentifier', {}),
        storage: storage('credentials'),
        cleanupStorage: storage('cleanup'),
        supports: policy => request('biometrics.supports', { policy }),
        hasKey: localKeyId => request('biometrics.hasKey', { localKeyId }),
        createKey: policy => request('biometrics.createKey', { policy }),
        sign: params => request('biometrics.sign', params),
        deleteKey: localKeyId => request('biometrics.deleteKey', { localKeyId }),
      }
    : undefined;
  const biometrics = new NativeBiometricCredentials(clerk, biometricHost);
  clerk.__internal_nativeBiometrics = biometrics;
  // Applications may supply their own passkey implementation through Expo.
  clerk.__internal_isWebAuthnSupported ??= () => supports('passkeys');
  clerk.__internal_isWebAuthnAutofillSupported ??= async () => supports('passkeys.autofill');
  clerk.__internal_isWebAuthnPlatformAuthenticatorSupported ??= async () => supports('passkeys');
  clerk.__internal_createPublicCredentials ??= options => nativeCredential('create', binaryToJSON(options), request);
  clerk.__internal_getPublicCredentials ??= ({
    publicKeyOptions,
    conditionalUI,
    preferImmediatelyAvailableCredentials,
  }) =>
    nativeCredential(
      'get',
      binaryToJSON({ ...publicKeyOptions, conditionalUI, preferImmediatelyAvailableCredentials }),
      request,
    );
  clerk.__internal_beforeNativeAuthReset = async reason => {
    host.cancelAuthentication();
    biometrics.invalidate();
    // Start every fence synchronously before awaiting storage IO.
    const credentials = host.invalidateCredentials();
    const link = magicLink.reset();
    const previousReset = previous.__internal_beforeNativeAuthReset?.(reason);
    await Promise.all([credentials, link, previousReset]);
  };
  const keys = Object.keys(previous) as (keyof typeof previous)[];
  const installed = Object.fromEntries(keys.map(key => [key, clerk[key]]));
  return {
    oauthTransport: {
      getRedirectUrl: () => host.callbackUrl,
      open: (url: URL) =>
        supports('browser')
          ? request<{ callbackUrl: string }>('browser', { url: url.toString(), callbackUrl: host.callbackUrl })
          : unavailable(),
    },
    retryCleanup: () => biometrics.retryPendingCleanup(),
    dispose() {
      if (disposed) return;
      disposed = true;
      host.cancelAuthentication();
      biometrics.invalidate();
      for (const key of keys) {
        if (clerk[key] === installed[key]) Object.assign(clerk, { [key]: previous[key] });
      }
    },
  };
}
