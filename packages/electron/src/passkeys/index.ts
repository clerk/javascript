import { ClerkWebAuthnError } from '@clerk/shared/error';
import { webAuthnCreateCredential, webAuthnGetCredential } from '@clerk/shared/internal/clerk-js/passkeys';
import type {
  CredentialReturn,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/shared/types';
import { isWebAuthnAutofillSupported, isWebAuthnPlatformAuthenticatorSupported } from '@clerk/shared/webauthn';

import { getPasskeyBridge, nativeCreateCredential, nativeGetCredential } from './renderer/native-bridge';
import type { PasskeyMode, StrategyEnv } from './renderer/strategy';
import { decidePath } from './renderer/strategy';

export type { PasskeyMode, PasskeyPath, StrategyEnv } from './renderer/strategy';

export type CreatePasskeysOptions = {
  /**
   * WebAuthn implementation to use:
   * `auto` chooses renderer WebAuthn for valid HTTPS origins and native WebAuthn otherwise.
   */
  mode?: PasskeyMode;
};

export type PasskeySupport = {
  create: (
    publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions,
  ) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>>;
  get: (args: {
    publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
  }) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>>;
  isSupported: () => boolean;
  isAutoFillSupported: () => Promise<boolean>;
  isPlatformAuthenticatorSupported: () => Promise<boolean>;
};

export type ClerkPasskeyHost = {
  __internal_createPublicCredentials: PasskeySupport['create'] | undefined;
  __internal_getPublicCredentials: PasskeySupport['get'] | undefined;
  __internal_isWebAuthnSupported: PasskeySupport['isSupported'] | undefined;
  __internal_isWebAuthnAutofillSupported: PasskeySupport['isAutoFillSupported'] | undefined;
  __internal_isWebAuthnPlatformAuthenticatorSupported: PasskeySupport['isPlatformAuthenticatorSupported'] | undefined;
};

const NATIVE_PLATFORMS = ['darwin', 'win32'];

function getEnv(): StrategyEnv {
  const bridge = getPasskeyBridge();
  const hasLocation = typeof location !== 'undefined';
  return {
    protocol: hasLocation ? location.protocol : '',
    hostname: hasLocation ? location.hostname : '',
    hasWebAuthn: typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function',
    nativeAvailable: !!bridge && NATIVE_PLATFORMS.includes(bridge.platform),
    platform: bridge?.platform ?? '',
    electronMajor: bridge?.electronMajor ?? 0,
  };
}

const unsupportedReturn = <T>(): CredentialReturn<T> =>
  ({
    publicKeyCredential: null,
    error: new ClerkWebAuthnError(
      'Clerk: Passkeys are not supported in this window. Serve the page from an https origin matching the RP ID, or enable the native passkey module with `passkeys: true` in createClerkBridge() and exposeClerkBridge().',
      { code: 'passkey_not_supported' },
    ),
  }) as CredentialReturn<T>;

const shouldRetryNativeAfterRendererError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const { code, message, name } = error as { code?: string; message?: string; name?: string };
  return (
    code === 'passkey_invalid_rpID_or_domain' ||
    name === 'NotSupportedError' ||
    message?.toLowerCase().includes('user agent does not support public key credentials') === true
  );
};

/** Creates an Electron passkey provider for clerk-js. */
export function createPasskeys(options?: CreatePasskeysOptions): PasskeySupport {
  const mode: PasskeyMode = options?.mode ?? 'auto';

  const create: PasskeySupport['create'] = async publicKey => {
    const env = getEnv();
    const path = decidePath(publicKey.rp.id ?? '', mode, env);

    if (path === 'unsupported') {
      return unsupportedReturn();
    }
    if (path === 'native') {
      return nativeCreateCredential(publicKey);
    }

    const result = await webAuthnCreateCredential(publicKey);
    if (result.error && shouldRetryNativeAfterRendererError(result.error) && mode === 'auto' && env.nativeAvailable) {
      return nativeCreateCredential(publicKey);
    }
    return result;
  };

  const get: PasskeySupport['get'] = async ({ publicKeyOptions }) => {
    const env = getEnv();
    const path = decidePath(publicKeyOptions.rpId ?? '', mode, env);

    if (path === 'unsupported') {
      return unsupportedReturn();
    }
    if (path === 'native') {
      return nativeGetCredential(publicKeyOptions);
    }

    const result = await webAuthnGetCredential({ publicKeyOptions, conditionalUI: false });
    if (result.error && shouldRetryNativeAfterRendererError(result.error) && mode === 'auto' && env.nativeAvailable) {
      return nativeGetCredential(publicKeyOptions);
    }
    return result;
  };

  const isSupported: PasskeySupport['isSupported'] = () => {
    const env = getEnv();
    if (mode === 'renderer') {
      return env.hasWebAuthn;
    }
    if (mode === 'native') {
      return env.nativeAvailable;
    }
    return env.hasWebAuthn || env.nativeAvailable;
  };

  const isAutoFillSupported: PasskeySupport['isAutoFillSupported'] = () => {
    return mode === 'native' ? Promise.resolve(false) : isWebAuthnAutofillSupported();
  };

  const isPlatformAuthenticatorSupported: PasskeySupport['isPlatformAuthenticatorSupported'] = async () => {
    const env = getEnv();
    if (env.nativeAvailable && mode !== 'renderer') {
      const bridge = getPasskeyBridge();
      try {
        const capabilities = await bridge?.capabilities();
        if (capabilities?.available) {
          return capabilities.platformAuthenticator;
        }
      } catch {
        // Fall back to Chromium's capability check.
      }
    }
    return isWebAuthnPlatformAuthenticatorSupported();
  };

  return { create, get, isSupported, isAutoFillSupported, isPlatformAuthenticatorSupported };
}

/**
 * Ready-to-use passkey implementation for the `ClerkProvider` `passkeys` prop.
 * Chooses renderer or native WebAuthn automatically per request.
 *
 * @example
 * ```tsx
 * import { ClerkProvider } from '@clerk/electron/react';
 * import { passkeys } from '@clerk/electron/passkeys';
 *
 * <ClerkProvider publishableKey={publishableKey} passkeys={passkeys} />
 * ```
 */
export const passkeys: PasskeySupport = createPasskeys();

/**
 * Wires passkey support into a Clerk instance. Call before `clerk.load()`.
 *
 * @example
 * ```ts
 * import { Clerk } from '@clerk/clerk-js';
 * import { createPasskeyProvider } from '@clerk/electron/passkeys';
 *
 * const clerk = new Clerk(publishableKey);
 * createPasskeyProvider(clerk);
 * await clerk.load();
 * ```
 */
export function createPasskeyProvider(clerk: ClerkPasskeyHost, options?: CreatePasskeysOptions): PasskeySupport {
  const passkeys = createPasskeys(options);

  clerk.__internal_createPublicCredentials = passkeys.create;
  clerk.__internal_getPublicCredentials = passkeys.get;
  clerk.__internal_isWebAuthnSupported = passkeys.isSupported;
  clerk.__internal_isWebAuthnAutofillSupported = passkeys.isAutoFillSupported;
  clerk.__internal_isWebAuthnPlatformAuthenticatorSupported = passkeys.isPlatformAuthenticatorSupported;

  return passkeys;
}
