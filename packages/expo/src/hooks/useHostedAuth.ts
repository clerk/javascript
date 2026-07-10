import { useClerk } from '@clerk/react';
import type * as AuthSession from 'expo-auth-session';
import type * as ExpoCrypto from 'expo-crypto';
import type * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { errorThrower } from '../utils/errors';
import type { HostedAuthClerkInstance } from '../utils/hostedAuth';
import { applyHostedAuthClientJSON, createHostedAuth, redeemHostedAuth } from '../utils/hostedAuth';

/**
 * Controls which Account Portal auth screen opens for hosted auth.
 */
export type HostedAuthMode = 'sign-in' | 'sign-up';

/**
 * Options for starting hosted auth from a native Expo application.
 */
export type StartHostedAuthParams = {
  /**
   * Native callback URL that Account Portal redirects to after auth completes.
   * Defaults to the canonical callback Clerk registers for the configured iOS
   * bundle identifier or Android package name. Expo Go and projects without a
   * configured application identifier fall back to `AuthSession.makeRedirectUri`.
   * Custom values must use a non-HTTP URL scheme.
   */
  redirectUrl?: string;
  /**
   * Initial hosted auth screen to open.
   */
  mode?: HostedAuthMode;
  /**
   * Options forwarded to `expo-web-browser` when opening the hosted auth session.
   */
  authSessionOptions?: Pick<WebBrowser.AuthSessionOpenOptions, 'showInRecents'>;
};

/**
 * Result returned after a hosted auth attempt finishes.
 */
export type StartHostedAuthReturnType = {
  /**
   * The session activated in the native SDK, or `null` when auth did not complete.
   */
  createdSessionId: string | null;
  /**
   * Result returned by the hosted browser session, or `null` when Clerk was not loaded.
   */
  authSessionResult: WebBrowser.WebBrowserAuthSessionResult | null;
};

type HostedAuthPKCE = {
  codeVerifier: string;
  codeChallenge: string;
};

/**
 * Returns helpers for authenticating native Expo users through Clerk's hosted Account Portal.
 */
export function useHostedAuth(): {
  startHostedAuth: (params?: StartHostedAuthParams) => Promise<StartHostedAuthReturnType>;
} {
  const clerk = useClerk();

  async function startHostedAuth(params: StartHostedAuthParams = {}): Promise<StartHostedAuthReturnType> {
    if (!clerk.loaded) {
      return {
        createdSessionId: null,
        authSessionResult: null,
      };
    }
    if (!clerk.client) {
      return errorThrower.throw('Hosted auth requires a loaded Clerk client.');
    }
    const hostedAuthClerk = getHostedAuthClerk(clerk);

    let AuthSessionModule: typeof AuthSession;
    let WebBrowserModule: typeof WebBrowser;
    try {
      // Load via synchronous require() instead of import(): Metro inlines require() into the main
      // bundle, while import() emits an async chunk that fails to resolve without @expo/metro-runtime.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      AuthSessionModule = require('expo-auth-session');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      WebBrowserModule = require('expo-web-browser');
    } catch (err) {
      return errorThrower.throw(
        `Unable to load expo-auth-session and expo-web-browser, which are required for hosted auth: ${
          err instanceof Error ? err.message : 'Unknown error'
        }. If they are not installed, run: npx expo install expo-auth-session expo-web-browser`,
      );
    }

    const redirectUrl = params.redirectUrl ?? getDefaultRedirectUrl(AuthSessionModule);
    assertSupportedRedirectUrl(redirectUrl);
    const state = createState();
    const pkce = await createPKCE();
    const hostedAuth = await createHostedAuth(
      {
        redirectUrl,
        codeChallenge: pkce.codeChallenge,
        mode: params.mode,
        state,
      },
      hostedAuthClerk,
    );

    const authSessionResult = await WebBrowserModule.openAuthSessionAsync(
      hostedAuth.url,
      redirectUrl,
      params.authSessionOptions,
    );
    if (authSessionResult.type !== 'success' || !authSessionResult.url) {
      return {
        createdSessionId: null,
        authSessionResult,
      };
    }

    let callbackUrl: URL;
    try {
      callbackUrl = new URL(authSessionResult.url);
    } catch {
      return errorThrower.throw('Hosted auth callback URL was invalid.');
    }
    if (!callbackUrlMatchesRedirectUrl(callbackUrl, redirectUrl)) {
      return errorThrower.throw('Hosted auth callback URL did not match the initiated redirect URL.');
    }

    const callbackParams = callbackUrl.searchParams;
    if (callbackParams.get('state') !== state) {
      return errorThrower.throw('Hosted auth callback state did not match the initiated state.');
    }

    const rotatingTokenNonce = callbackParams.get('rotating_token_nonce') ?? '';
    if (!rotatingTokenNonce) {
      return errorThrower.throw('Hosted auth callback did not include a rotating token nonce.');
    }

    const clientJSON = await redeemHostedAuth(
      {
        rotatingTokenNonce,
        codeVerifier: pkce.codeVerifier,
      },
      hostedAuthClerk,
    );

    const createdSessionId = normalizeSessionId(
      callbackParams.get('created_session_id') || clientJSON.last_active_session_id,
    );
    if (!createdSessionId || !clientJSON.sessions.some(session => session.id === createdSessionId)) {
      return errorThrower.throw('Hosted auth completion did not include the created session.');
    }

    applyHostedAuthClientJSON(clerk.client, clientJSON);
    await clerk.setActive({
      session: createdSessionId,
    });

    return {
      createdSessionId,
      authSessionResult,
    };
  }

  return {
    startHostedAuth,
  };
}

function getDefaultRedirectUrl(AuthSessionModule: typeof AuthSession): string {
  const appIdentifier = getExpoAppIdentifier();
  if (appIdentifier && Platform.OS === 'ios') {
    return `${appIdentifier}://callback`;
  }
  if (appIdentifier && Platform.OS === 'android') {
    return `clerk://${appIdentifier}.callback`;
  }

  return AuthSessionModule.makeRedirectUri({
    path: 'hosted-auth-callback',
    isTripleSlashed: true,
  });
}

function getExpoAppIdentifier(): string | undefined {
  try {
    // expo-constants is already an optional @clerk/expo peer and is present in
    // standard Expo projects. Keep the fallback below for Expo Go and bare apps.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const constantsModule = require('expo-constants') as {
      default?: {
        appOwnership?: string | null;
        executionEnvironment?: string;
        expoConfig?: {
          ios?: { bundleIdentifier?: string };
          android?: { package?: string };
        };
      };
    };
    const constants = constantsModule.default;
    if (constants?.executionEnvironment === 'storeClient' || constants?.appOwnership === 'expo') {
      return undefined;
    }

    const expoConfig = constants?.expoConfig;
    return Platform.OS === 'ios' ? expoConfig?.ios?.bundleIdentifier : expoConfig?.android?.package;
  } catch {
    return undefined;
  }
}

function getHostedAuthClerk(clerk: ReturnType<typeof useClerk>): HostedAuthClerkInstance {
  const hostedAuthClerk = clerk as ReturnType<typeof useClerk> & Partial<HostedAuthClerkInstance>;
  if (typeof hostedAuthClerk.getFapiClient !== 'function') {
    return errorThrower.throw('Hosted auth requires a Clerk instance that can make FAPI requests.');
  }

  return hostedAuthClerk as HostedAuthClerkInstance;
}

function normalizeSessionId(sessionId: string | null | undefined): string | null {
  return sessionId || null;
}

function createState(): string {
  return loadExpoCrypto().randomUUID();
}

async function createPKCE(): Promise<HostedAuthPKCE> {
  const Crypto = loadExpoCrypto();
  const codeVerifier = bytesToHex(Crypto.getRandomBytes(32));
  const codeChallenge = base64ToBase64Url(
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, codeVerifier, {
      encoding: Crypto.CryptoEncoding.BASE64,
    }),
  );

  return {
    codeVerifier,
    codeChallenge,
  };
}

function loadExpoCrypto(): typeof ExpoCrypto {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-crypto') as typeof ExpoCrypto;
  } catch {
    return errorThrower.throw(
      'expo-crypto is required to start hosted auth. Please install it by running: npx expo install expo-crypto',
    );
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function callbackUrlMatchesRedirectUrl(callbackUrl: URL, redirectUrl: string): boolean {
  let expectedUrl: URL;
  try {
    expectedUrl = new URL(redirectUrl);
  } catch {
    return false;
  }

  if (callbackUrl.protocol !== expectedUrl.protocol) {
    return false;
  }

  if (callbackUrl.host !== expectedUrl.host) {
    return false;
  }

  return callbackUrl.pathname === expectedUrl.pathname;
}

function assertSupportedRedirectUrl(redirectUrl: string): void {
  let protocol: string;
  try {
    protocol = new URL(redirectUrl).protocol;
  } catch {
    return errorThrower.throw('Hosted auth redirect URL was invalid.');
  }

  if (protocol === 'http:' || protocol === 'https:') {
    return errorThrower.throw('Hosted auth requires a custom-scheme redirect URL in Expo.');
  }
}
