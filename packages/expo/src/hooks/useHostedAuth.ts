import { useClerk } from '@clerk/react';
import type * as AuthSession from 'expo-auth-session';
import type * as ExpoCrypto from 'expo-crypto';
import type * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { getClerkInstance } from '../provider/singleton';
import { errorThrower } from '../utils/errors';
import type { HostedAuthClerkInstance, HostedAuthMode } from '../utils/hostedAuth';
import { applyHostedAuthClientJSON, createHostedAuth, redeemHostedAuth } from '../utils/hostedAuth';

export type { HostedAuthMode };

// Hosted auth keeps its `state` and PKCE verifier in memory for the duration of a single
// `startHostedAuth` call. If Android kills the app process while the Custom Tab is in the
// foreground, the flow cannot be resumed and must be restarted. This is an accepted
// limitation, consistent with `useSSO`.
let hostedAuthInProgress = false;
let hasWarnedAndroidDefaultRedirect = false;

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
   *
   * On Android, the default `clerk://<package>.callback` URL only reaches the app
   * when the Clerk Expo config plugin is enabled in `app.json` and the native
   * project has been rebuilt (for example with `npx expo prebuild`), because the
   * plugin registers the matching intent filter. Without it, the browser cannot
   * redirect back to the app and the flow hangs in the Custom Tab. Pass a custom
   * `redirectUrl` handled by the app to opt out of this requirement.
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
 *
 * On Android, the default redirect URL depends on an intent filter that only the Clerk Expo
 * config plugin registers: the plugin must be enabled in `app.json` and the native project
 * rebuilt (for example with `npx expo prebuild`), or the browser cannot return to the app
 * after auth completes. See {@link StartHostedAuthParams.redirectUrl}.
 */
export function useHostedAuth(): {
  startHostedAuth: (params?: StartHostedAuthParams) => Promise<StartHostedAuthReturnType>;
} {
  const clerk = useClerk();

  /**
   * Opens Account Portal in an auth session and activates the session it creates.
   * Only one hosted auth flow can run at a time; concurrent calls throw.
   */
  async function startHostedAuth(params: StartHostedAuthParams = {}): Promise<StartHostedAuthReturnType> {
    if (hostedAuthInProgress) {
      return errorThrower.throw('Hosted auth is already in progress.');
    }

    hostedAuthInProgress = true;
    try {
      return await runHostedAuth(params);
    } finally {
      hostedAuthInProgress = false;
    }
  }

  async function runHostedAuth(params: StartHostedAuthParams): Promise<StartHostedAuthReturnType> {
    if (!clerk.loaded) {
      return {
        createdSessionId: null,
        authSessionResult: null,
      };
    }
    if (!clerk.client) {
      return errorThrower.throw('Hosted auth requires a loaded Clerk client.');
    }
    const hostedAuthClerk = getHostedAuthClerk();

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

    // A successful redemption means the server session exists and the rotated client
    // token has already been persisted locally by the response middleware. Sync the
    // local client state before validating the created session, so a validation
    // failure below does not leave the local client stale against the rotated token.
    applyHostedAuthClientJSON(clerk.client, clientJSON);

    const createdSessionId = normalizeSessionId(
      callbackParams.get('created_session_id') || clientJSON.last_active_session_id,
    );
    if (!createdSessionId) {
      return errorThrower.throw('Hosted auth completion did not include a created session id.');
    }
    if (!clientJSON.sessions.some(session => session.id === createdSessionId)) {
      return errorThrower.throw('Hosted auth created session was not found on the redeemed client.');
    }

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
    warnAndroidDefaultRedirectOnce();
    return `clerk://${appIdentifier}.callback`;
  }

  return AuthSessionModule.makeRedirectUri({
    path: 'hosted-auth-callback',
    isTripleSlashed: true,
  });
}

function warnAndroidDefaultRedirectOnce(): void {
  if (__DEV__ && !hasWarnedAndroidDefaultRedirect) {
    hasWarnedAndroidDefaultRedirect = true;
    console.warn(
      '[useHostedAuth] The default Android redirect URL relies on the `clerk://<package>.callback` intent ' +
        'filter registered by the Clerk Expo config plugin. If the plugin is not enabled in app.json or the ' +
        'native project has not been rebuilt since (e.g. `npx expo prebuild`), the browser cannot redirect ' +
        'back to the app and hosted auth will hang. Alternatively, pass a custom `redirectUrl` handled by the app.',
    );
  }
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

function getHostedAuthClerk(): HostedAuthClerkInstance {
  const hostedAuthClerk = getClerkInstance() as Partial<HostedAuthClerkInstance> | undefined;
  if (typeof hostedAuthClerk?.getFapiClient !== 'function') {
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
  const codeChallenge = await createCodeChallenge(codeVerifier, verifier =>
    Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
      encoding: Crypto.CryptoEncoding.BASE64,
    }),
  );

  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Derives the S256 PKCE code challenge (RFC 7636) from a code verifier,
 * given a function that returns the standard-base64 SHA-256 digest of a string.
 *
 * @internal Exported for testing.
 */
export async function createCodeChallenge(
  codeVerifier: string,
  sha256Base64: (value: string) => Promise<string>,
): Promise<string> {
  return base64ToBase64Url(await sha256Base64(codeVerifier));
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
