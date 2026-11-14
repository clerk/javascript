import { Platform } from 'react-native';

import { getClerkInstance } from '../provider/singleton';
import type { FapiResponse } from '../utils/fapiRequest';
import { getResponseJSON, toClerkAPIResponseError } from '../utils/fapiRequest';
import { sessionTransferError } from './errors';

/**
 * Where the session transfer URL will be opened. Use `webview` for a WebView your app renders,
 * and `browser` for the system browser or an in-app browser tab.
 */
export type SessionTransferPresentation = 'webview' | 'browser';

/**
 * Options for preparing a session transfer.
 */
export type PrepareSessionTransferParams = {
  /**
   * Absolute URL on one of your instance's domains. It must use HTTPS outside development instances.
   */
  destination: string;
  /**
   * Where the URL will be opened.
   */
  presentation: SessionTransferPresentation;
};

/**
 * A one-time URL that signs the active user in on the web.
 */
export type SessionTransfer = {
  /**
   * Open it once, within 60 seconds, and never log or store it. It is not enumerable, so
   * `console.log`, `JSON.stringify`, and object spread leave it out.
   */
  readonly url: string;
  /**
   * When the URL stops working.
   */
  readonly expiresAt: Date;
};

type SessionTransferJSON = {
  object: 'session_transfer';
  url: unknown;
  expires_at: unknown;
};

type SessionTransferFapiClient = {
  request: (requestInit: {
    method: 'POST';
    path: string;
    body: { redirectUrl: string; presentationMode: SessionTransferPresentation };
  }) => Promise<FapiResponse<SessionTransferJSON>>;
};

type FapiCapableClerk = {
  getFapiClient: () => SessionTransferFapiClient;
  handleUnauthenticated?: () => Promise<unknown>;
};

export type TransferRequest = {
  readonly key: string;
  readonly clerk: FapiCapableClerk;
  readonly sessionId: string;
  readonly destination: string;
  readonly presentation: SessionTransferPresentation;
};

export type TransferLease = {
  readonly key: string;
  readonly transfer: Promise<SessionTransfer>;
};

type LedgerEntry = {
  readonly lease: TransferLease;
  expiresAt: number | null;
};

const MIN_REMAINING_MS = 15_000;
const MINT_TIME_LIMIT_MS = 20_000;
const unclaimed = new Map<string, LedgerEntry>();

/**
 * Creates a one-time URL that signs the active session's user in on `destination`. Every call
 * creates a new transfer. Rejects with a `SessionTransferError`.
 *
 * Use it only to present the URL yourself. `useAuthenticatedWebView` and
 * `useNativeToWeb().openExternalBrowser` cover WebViews and the system browser.
 *
 * > [!WARNING]
 * > Android browsers redeem the URL only when the app sets `android.intent.extra.REFERRER_NAME`
 * > to `android-app://<your package name>` on the intent that opens it. `expo-web-browser` Custom Tabs
 * > cannot set it, so redemption fails there with `cross_site_request`.
 *
 * @param params - The destination and where the URL will be opened.
 * @returns The URL and when it expires.
 *
 * @example
 * ### Open the destination in an in-app browser on iOS
 * ```ts
 * import { prepareSessionTransfer } from '@clerk/expo/native-to-web/advanced';
 * import * as WebBrowser from 'expo-web-browser';
 *
 * const transfer = await prepareSessionTransfer({
 *   destination: 'https://app.example.com/reports',
 *   presentation: 'browser',
 * });
 * await WebBrowser.openBrowserAsync(transfer.url);
 * ```
 */
export async function prepareSessionTransfer(params: PrepareSessionTransferParams): Promise<SessionTransfer> {
  return mintSessionTransfer(resolveTransferRequest(params));
}

export function resolveTransferRequest({ destination, presentation }: PrepareSessionTransferParams): TransferRequest {
  if (Platform.OS === 'web') {
    throw sessionTransferError('unsupported_platform', 'Session transfer is only available in native apps.');
  }
  if (!isAbsoluteHttpUrl(destination)) {
    throw sessionTransferError(
      'invalid_destination',
      'The session transfer destination must be an absolute http or https URL.',
    );
  }

  const clerk = getLoadedClerk();
  if (!clerk) {
    throw sessionTransferError('clerk_not_loaded', 'Clerk must finish loading before preparing a session transfer.');
  }

  const session = clerk.session;
  if (!session || session.status === 'pending') {
    throw sessionTransferError('signed_out', 'A session transfer requires an active session.');
  }

  return {
    key: `${session.id}\n${presentation}\n${destination}`,
    clerk,
    sessionId: session.id,
    destination,
    presentation,
  };
}

export function acquireTransfer(request: TransferRequest, { fresh = false } = {}): TransferLease {
  evictExpiring(Date.now());

  const existing = unclaimed.get(request.key);
  if (existing && !fresh) {
    return existing.lease;
  }

  const transfer = mintSessionTransfer(request);
  const entry: LedgerEntry = { lease: { key: request.key, transfer }, expiresAt: null };
  unclaimed.set(request.key, entry);
  transfer.then(
    minted => {
      entry.expiresAt = minted.expiresAt.getTime();
    },
    () => {
      if (unclaimed.get(request.key) === entry) {
        unclaimed.delete(request.key);
      }
    },
  );

  return entry.lease;
}

export function claimTransfer(lease: TransferLease): boolean {
  return unclaimed.get(lease.key)?.lease === lease && unclaimed.delete(lease.key);
}

function evictExpiring(now: number): void {
  for (const [key, entry] of unclaimed) {
    if (entry.expiresAt !== null && entry.expiresAt - now < MIN_REMAINING_MS) {
      unclaimed.delete(key);
    }
  }
}

export async function mintSessionTransfer({
  clerk,
  sessionId,
  destination,
  presentation,
}: TransferRequest): Promise<SessionTransfer> {
  let response: FapiResponse<SessionTransferJSON>;
  try {
    response = await withinMintTimeLimit(
      clerk.getFapiClient().request({
        method: 'POST',
        path: `/client/sessions/${sessionId}/session_transfers`,
        body: { redirectUrl: destination, presentationMode: presentation },
      }),
    );
  } catch (cause) {
    throw sessionTransferError('network_error', 'Clerk could not be reached to prepare the session transfer.', cause);
  }

  if (!response.ok) {
    const apiError = toClerkAPIResponseError(response, 'Clerk refused to prepare the session transfer.');
    if (apiError.errors[0]?.code === 'signed_out') {
      await clerk.handleUnauthenticated?.().catch(() => undefined);
    }
    throw sessionTransferError(apiError.errors[0]?.code ?? 'unexpected_response', apiError.message, apiError);
  }

  return parseSessionTransfer(getResponseJSON(response.payload, 'session_transfer'));
}

function withinMintTimeLimit<T>(request: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Clerk did not respond within ${MINT_TIME_LIMIT_MS / 1000} seconds.`)),
      MINT_TIME_LIMIT_MS,
    );
    void request.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

function parseSessionTransfer(json: SessionTransferJSON | null): SessionTransfer {
  if (
    !json ||
    typeof json.url !== 'string' ||
    !isRedeemableUrl(json.url) ||
    typeof json.expires_at !== 'number' ||
    !Number.isFinite(json.expires_at)
  ) {
    throw sessionTransferError('unexpected_response', 'Clerk returned an unexpected session transfer response.');
  }

  const transfer = { url: json.url, expiresAt: new Date(json.expires_at) };
  return Object.defineProperty(transfer, 'url', { enumerable: false, writable: false });
}

function getLoadedClerk() {
  let clerk: ReturnType<typeof getClerkInstance>;
  try {
    clerk = getClerkInstance();
  } catch {
    return null;
  }

  return clerk?.loaded && canRequestFapi(clerk) ? clerk : null;
}

function canRequestFapi<C extends object>(clerk: C): clerk is C & FapiCapableClerk {
  return 'getFapiClient' in clerk && typeof clerk.getFapiClient === 'function';
}

function isRedeemableUrl(value: string): boolean {
  try {
    const { protocol, hostname, username, password } = new URL(value);
    return protocol === 'https:' && hostname !== '' && username === '' && password === '';
  } catch {
    return false;
  }
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}
