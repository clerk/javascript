import { useClerk } from '@clerk/react';

import type { OAuthTransport } from '../shared/types';
import { getClerkInstance } from './create-clerk-instance';
import type { HostedAuthClerkInstance, HostedAuthMode } from './hosted-auth';
import { applyHostedAuthClientJSON, createHostedAuth, redeemHostedAuth } from './hosted-auth';

export type { HostedAuthMode };

// Guarding before the FAPI request avoids creating a hosted auth session that can never be redeemed.
let hostedAuthInProgress = false;

/**
 * Options for starting hosted auth from an Electron application.
 */
export type StartHostedAuthParams = {
  /**
   * Initial hosted auth screen to open.
   */
  mode?: HostedAuthMode;
};

/**
 * Result returned after a hosted auth attempt finishes.
 */
export type StartHostedAuthReturnType = {
  /**
   * The session activated in the Electron SDK, or `null` when Clerk was not loaded.
   */
  createdSessionId: string | null;
};

type HostedAuthPKCE = {
  codeVerifier: string;
  codeChallenge: string;
};

/**
 * Returns helpers for authenticating Electron users through Clerk's hosted Account Portal
 * in the system browser.
 *
 * Requires the Clerk preload bridge (`exposeClerkBridge()`) and the deep-link transport
 * registered with `createClerkBridge({ renderer })`, which owns the redirect back into the app.
 */
export function useHostedAuth(): {
  startHostedAuth: (params?: StartHostedAuthParams) => Promise<StartHostedAuthReturnType>;
} {
  const clerk = useClerk();

  /**
   * Opens Account Portal in the system browser and activates the session it creates.
   * Only one hosted auth flow can run at a time; concurrent calls throw.
   */
  async function startHostedAuth(params: StartHostedAuthParams = {}): Promise<StartHostedAuthReturnType> {
    if (hostedAuthInProgress) {
      throw new Error('Clerk: a hosted authentication session is already in progress.');
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
      return { createdSessionId: null };
    }
    if (!clerk.client) {
      throw new Error('Clerk: hosted auth requires a loaded Clerk client.');
    }
    const hostedAuthClerk = getHostedAuthClerk();
    const transport = getOAuthTransport();

    let redirectUrl: string;
    try {
      redirectUrl = await transport.getRedirectUrl();
    } catch {
      throw new Error(
        'Clerk: hosted auth requires the deep-link transport. Pass createClerkBridge({ renderer }) in the main process.',
      );
    }

    const state = crypto.randomUUID();
    const pkce = await createPKCE();
    const hostedAuthUrl = await createHostedAuth(
      {
        redirectUrl,
        codeChallenge: pkce.codeChallenge,
        mode: params.mode,
        state,
      },
      hostedAuthClerk,
    );

    // The main process only resolves callback URLs matching the registered renderer scheme.
    const { callbackUrl } = await transport.open(hostedAuthUrl);
    const callbackParams = new URL(callbackUrl).searchParams;

    if (callbackParams.get('state') !== state) {
      throw new Error('Clerk: hosted auth callback state did not match the initiated state.');
    }

    const rotatingTokenNonce = callbackParams.get('rotating_token_nonce') ?? '';
    if (!rotatingTokenNonce) {
      throw new Error('Clerk: hosted auth callback did not include a rotating token nonce.');
    }

    const createdSessionId = callbackParams.get('created_session_id');
    if (!createdSessionId) {
      throw new Error('Clerk: hosted auth callback did not include the created session.');
    }

    const clientJSON = await redeemHostedAuth(
      {
        rotatingTokenNonce,
        codeVerifier: pkce.codeVerifier,
      },
      hostedAuthClerk,
    );

    // A successful redemption means the server session exists and the rotated client
    // token has already been persisted locally by the response hook. Sync the
    // local client state before validating the created session, so a validation
    // failure below does not leave the local client stale against the rotated token.
    applyHostedAuthClientJSON(clerk.client, clientJSON);

    if (!clientJSON.sessions.some(session => session.id === createdSessionId)) {
      throw new Error('Clerk: hosted auth completion did not include the created session.');
    }

    await clerk.setActive({
      session: createdSessionId,
    });

    return { createdSessionId };
  }

  return {
    startHostedAuth,
  };
}

function getOAuthTransport(): OAuthTransport {
  const transport = window.__clerk_internal_electron?.oauthTransport;
  if (!transport) {
    throw new Error(
      'Clerk: hosted auth requires the Clerk preload bridge. Call exposeClerkBridge() from your preload script.',
    );
  }

  return transport;
}

function getHostedAuthClerk(): HostedAuthClerkInstance {
  const hostedAuthClerk = getClerkInstance() as Partial<HostedAuthClerkInstance> | null;
  if (typeof hostedAuthClerk?.getFapiClient !== 'function') {
    throw new Error('Clerk: hosted auth requires a Clerk instance that can make FAPI requests.');
  }

  return hostedAuthClerk as HostedAuthClerkInstance;
}

// S256 code challenge per RFC 7636: base64url of the SHA-256 digest of the verifier.
async function createPKCE(): Promise<HostedAuthPKCE> {
  const codeVerifier = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));

  return {
    codeVerifier,
    codeChallenge: bytesToBase64Url(new Uint8Array(digest)),
  };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
