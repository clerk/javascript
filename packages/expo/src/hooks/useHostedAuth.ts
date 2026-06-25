import { useClerk } from '@clerk/react';
import type { ClientResource } from '@clerk/shared/types';
import type * as AuthSession from 'expo-auth-session';
import type * as ExpoCrypto from 'expo-crypto';
import type * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';
import { createHostedAuth, type FapiHostedAuthMode, redeemHostedAuth } from '../utils/hostedAuth';

/**
 * Controls which Account Portal auth screen opens for hosted auth.
 */
export type HostedAuthMode = 'sign-in' | 'sign-up';

/**
 * Options for starting hosted auth from a native Expo application.
 */
export type StartHostedAuthParams = {
  /**
   * Native deep-link URL that Account Portal redirects to after auth completes.
   * Defaults to `AuthSession.makeRedirectUri({ path: 'hosted-auth-callback', isTripleSlashed: true })`.
   * Production instances must allowlist this URL in the Clerk Dashboard.
   */
  redirectUrl?: string;
  /**
   * Initial hosted auth screen to open.
   */
  mode?: HostedAuthMode;
  /**
   * Optional opaque state value used to bind the browser callback to this auth attempt.
   * A cryptographically random value is generated when omitted.
   */
  state?: string;
  /**
   * Options forwarded to `expo-web-browser` when opening the hosted auth session.
   */
  authSessionOptions?: {
    showInRecents?: boolean;
  };
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
  authSessionResult: {
    type: string;
    url?: string | null;
  } | null;
  /**
   * The current Clerk client after hosted auth completes.
   */
  client?: {
    id?: string;
    lastActiveSessionId: string | null;
  };
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
        client: clerk.client,
      };
    }
    if (!clerk.client) {
      return errorThrower.throw('Hosted auth requires a loaded Clerk client.');
    }

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

    const redirectUrl =
      params.redirectUrl ??
      AuthSessionModule.makeRedirectUri({
        path: 'hosted-auth-callback',
        isTripleSlashed: true,
      });
    const state = params.state ?? createState();
    const pkce = await createPKCE();
    const hostedAuth = await createHostedAuth(
      {
        redirectUrl,
        codeChallenge: pkce.codeChallenge,
        mode: toFapiMode(params.mode),
        state,
      },
      clerk,
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
        client: clerk.client,
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

    let updatedClient: ClientResource | undefined;
    let createdSessionId: string | null = null;
    const rotatingTokenNonce = callbackParams.get('rotating_token_nonce') ?? '';
    if (rotatingTokenNonce) {
      updatedClient = await redeemHostedAuth(
        {
          rotatingTokenNonce,
          codeVerifier: pkce.codeVerifier,
        },
        clerk.client,
        clerk,
      );
      if (updatedClient) {
        getClientUpdater(clerk)?.(updatedClient);
        createdSessionId = normalizeSessionId(
          callbackParams.get('created_session_id') || updatedClient.lastActiveSessionId,
        );
      }
    }
    if (createdSessionId) {
      await clerk.setActive({
        session: createdSessionId,
      });
    }

    return {
      createdSessionId,
      authSessionResult,
      client: updatedClient ?? clerk.client,
    };
  }

  return {
    startHostedAuth,
  };
}

function getClientUpdater(clerk: ReturnType<typeof useClerk>): ((client: ClientResource) => void) | undefined {
  const maybeClerkWithClientUpdater = clerk as typeof clerk & {
    updateClient?: (client: ClientResource) => void;
  };

  return maybeClerkWithClientUpdater.updateClient;
}

function toFapiMode(mode: HostedAuthMode | undefined): FapiHostedAuthMode | undefined {
  if (mode === 'sign-in') {
    return 'sign_in';
  }

  if (mode === 'sign-up') {
    return 'sign_up';
  }

  return undefined;
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
