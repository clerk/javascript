import { useClerk } from '@clerk/react';
import type { ClientResource } from '@clerk/shared/types';
import type * as AuthSession from 'expo-auth-session';
import type * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';
import { createHostedAuth, type FapiHostedAuthInitialPage } from '../utils/hostedAuth';

export type HostedAuthInitialPage = 'sign-in' | 'sign-up';

export type StartHostedAuthParams = {
  redirectUrl?: string;
  initialPage?: HostedAuthInitialPage;
  state?: string;
  authSessionOptions?: Pick<WebBrowser.AuthSessionOpenOptions, 'showInRecents'>;
};

export type StartHostedAuthReturnType = {
  createdSessionId: string | null;
  authSessionResult: WebBrowser.WebBrowserAuthSessionResult | null;
  client?: ClientResource;
};

export function useHostedAuth() {
  const clerk = useClerk();

  async function startHostedAuth(params: StartHostedAuthParams = {}): Promise<StartHostedAuthReturnType> {
    if (!clerk.loaded) {
      return {
        createdSessionId: null,
        authSessionResult: null,
        client: clerk.client,
      };
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
    const state = params.state ?? (await createState());
    if (!clerk.client) {
      return errorThrower.throw('Hosted auth requires a loaded Clerk client.');
    }
    const hostedAuth = await createHostedAuth({
      redirectUrl,
      initialPage: toFapiInitialPage(params.initialPage),
      state,
    });

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

    const callbackUrl = new URL(authSessionResult.url);
    if (!callbackUrlMatchesRedirectUrl(callbackUrl, redirectUrl)) {
      return errorThrower.throw('Hosted auth callback URL did not match the initiated redirect URL.');
    }

    const callbackParams = callbackUrl.searchParams;
    if (callbackParams.get('state') !== state) {
      return errorThrower.throw('Hosted auth callback state did not match the initiated state.');
    }

    let updatedClient: ClientResource | undefined;
    const rotatingTokenNonce = callbackParams.get('rotating_token_nonce') ?? '';
    if (rotatingTokenNonce) {
      updatedClient = await clerk.client?.reload({ rotatingTokenNonce });
      if (updatedClient) {
        getClientUpdater(clerk)?.(updatedClient);
      }
    }
    const createdSessionId =
      callbackParams.get('created_session_id') ??
      updatedClient?.lastActiveSessionId ??
      clerk.client?.lastActiveSessionId ??
      null;
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

function toFapiInitialPage(initialPage: HostedAuthInitialPage | undefined): FapiHostedAuthInitialPage | undefined {
  if (initialPage === 'sign-in') {
    return 'sign_in';
  }

  if (initialPage === 'sign-up') {
    return 'sign_up';
  }

  return undefined;
}

async function createState(): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomUUID } = require('expo-crypto') as typeof import('expo-crypto');
    return randomUUID();
  } catch {
    return errorThrower.throw(
      'expo-crypto is required to start hosted auth without an explicit state. ' +
        'Please install it by running: npx expo install expo-crypto',
    );
  }
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

  if (expectedUrl.host && callbackUrl.host !== expectedUrl.host) {
    return false;
  }

  return !expectedUrl.pathname || callbackUrl.pathname === expectedUrl.pathname;
}
