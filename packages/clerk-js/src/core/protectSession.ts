import type { ProtectLoader } from '@clerk/shared/types';

import { SafeLock } from './auth/safeLock';

/**
 * Correlation id and Protect session token acquisition.
 *
 * The browser mints an opaque correlation id (`cid`) and hands it to the loader through the
 * element's attributes, which are per-instance server config. The server then issues a signed
 * session token, which we acquire exactly once per browser session across all tabs and attach
 * to sign-in and sign-up requests.
 *
 * Acquisition failure is never fatal: a structured status travels in the token's place so that
 * a blocked or failed acquisition becomes a reportable fact rather than silence.
 */

/** Persistent, per-app-origin client id. Opaque and random — nothing about the device. */
const PID_STORAGE_KEY = '__clerk_protect_pid';
/** The shared `{ token, exp, rid }` store every tab reads before it considers acquiring. */
const TOKEN_STORAGE_KEY = '__clerk_protect_st';
const ACQUISITION_LOCK_KEY = 'clerk.lock.protectSessionToken';

/** A token this close to expiry is treated as absent, so a fresh run starts before it lapses. */
const TOKEN_REFRESH_MARGIN_MS = 60 * 1_000;
/** Acquisition deadline when the instance does not configure one. */
const DEFAULT_TOKEN_TIMEOUT_MS = 5 * 1_000;
/** Bounds we hold the server-supplied `retry_in_ms` to. */
const MIN_RETRY_DELAY_MS = 50;
const MAX_RETRY_DELAY_MS = 1_000;

/** Lowercase RFC 4648 base32 — a `cid` has to survive case-insensitive, alphanumeric-only contexts. */
const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
/** 128 bits of base32, unpadded. */
const BASE32_128_REGEX = /^[a-z2-7]{26}$/;
/** The full correlation id, identical to the regex FAPI validates against. */
export const CID_REGEX = /^1-[a-z2-7]{26}-[a-z2-7]{26}$/;

/** The closed set of placeholders `applyLoader` substitutes. Anything else is left verbatim. */
const PLACEHOLDER_REGEX = /\{(cid|pid|rid|instance_id)\}/g;
/** Non-global twin of the above, so `test` does not carry `lastIndex` between calls. */
const HAS_PLACEHOLDER_REGEX = /\{(?:cid|pid|rid|instance_id)\}/;

/**
 * Closed set — FAPI validates these by exact match and drops anything else, so a new value here
 * is a wire change.
 */
export type ProtectStatus = 'ok' | 'timeout' | 'script_error' | 'fetch_error' | 'unsupported' | `http_${number}`;

export type ProtectPlaceholders = {
  cid?: string;
  pid?: string;
  rid?: string;
  instance_id?: string;
};

/** The params attached to the form-encoded body of sign-in and sign-up POSTs. */
export type ProtectRequestParams = {
  __clerk_protect_token?: string;
  __clerk_protect_status: ProtectStatus;
  __clerk_protect_cid?: string;
};

type StoredToken = {
  token: string;
  /** Unix seconds, as served by the token endpoint. */
  exp: number;
  rid: string;
};

/**
 * Substitutes the closed placeholder set. A recognised placeholder with no value available, and
 * any unrecognised `{…}`, is left verbatim — the server treats an unsubstituted placeholder as
 * "no id" and serves normally, which is what keeps older SDK builds working against a templated
 * loader config.
 */
export function interpolatePlaceholders(value: string, placeholders: ProtectPlaceholders): string {
  return value.replace(PLACEHOLDER_REGEX, (match, name: keyof ProtectPlaceholders) => placeholders[name] ?? match);
}

/** Lowercase RFC 4648 base32, unpadded. 16 bytes in, 26 chars out. */
export function encodeBase32(bytes: Uint8Array): string {
  let out = '';
  let value = 0;
  let bits = 0;

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return out;
}

/** 128 random bits as base32, or `null` when the platform has no CSPRNG. */
function random128(): string | null {
  const webCrypto = typeof crypto !== 'undefined' ? crypto : undefined;
  if (typeof webCrypto?.getRandomValues !== 'function') {
    return null;
  }

  try {
    return encodeBase32(webCrypto.getRandomValues(new Uint8Array(16)));
  } catch {
    return null;
  }
}

export function buildCid(pid: string, rid: string): string {
  return `1-${pid}-${rid}`;
}

/**
 * `localStorage` with an in-memory fallback. A sandboxed iframe, blocked storage or a full quota
 * costs us cross-tab sharing, never a sign-in, so nothing in here throws.
 */
const memoryStore = new Map<string, string>();

function localStorageOrNull(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readStored(key: string): string | null {
  try {
    const storage = localStorageOrNull();
    if (storage) {
      return storage.getItem(key);
    }
  } catch {
    // blocked — the in-memory fallback is the only copy there is
  }
  return memoryStore.get(key) ?? null;
}

function writeStored(key: string, value: string): void {
  try {
    const storage = localStorageOrNull();
    if (storage) {
      storage.setItem(key, value);
      return;
    }
  } catch {
    // blocked or over quota — fall through
  }
  // In-memory only, for the lifetime of this page. We lose cross-tab sharing, not the sign-in.
  memoryStore.set(key, value);
}

function readOrMintPid(): string | null {
  const existing = readStored(PID_STORAGE_KEY);
  if (existing && BASE32_128_REGEX.test(existing)) {
    return existing;
  }

  const minted = random128();
  if (minted) {
    writeStored(PID_STORAGE_KEY, minted);
  }
  return minted;
}

/**
 * Reads the shared token store. `marginMs` is how much remaining life a token needs to count as
 * present: the acquisition path demands a margin so a run starts before the token lapses, while
 * the request path takes anything not yet expired.
 */
function readStoredToken(marginMs: number): StoredToken | null {
  const raw = readStored(TOKEN_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const { token, exp, rid } = parsed as Record<string, unknown>;
  if (typeof token !== 'string' || !token) {
    return null;
  }
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return null;
  }
  if (typeof rid !== 'string' || !BASE32_128_REGEX.test(rid)) {
    return null;
  }
  if (exp * 1_000 - marginMs <= Date.now()) {
    return null;
  }

  return { token, exp, rid };
}

function writeStoredToken(value: StoredToken): void {
  writeStored(TOKEN_STORAGE_KEY, JSON.stringify(value));
}

function httpStatus(status: number): ProtectStatus {
  // The status enum only admits `http_1xx`-`http_5xx`; anything else would be dropped by FAPI.
  return status >= 100 && status <= 599 ? (`http_${status}` as ProtectStatus) : 'fetch_error';
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Resolves the token endpoint for a loader.
 *
 * `tokenUrl` is the explicit form: like every other part of the loader it is instance config, so a
 * new placement ships without an SDK release. When it is absent we resolve `token` relative to the
 * loader URL that carries the `{cid}`. Any placement where the `{cid}` is not a path segment has
 * to declare `tokenUrl` explicitly.
 */
function resolveTokenUrl(loader: ProtectLoader, placeholders: ProtectPlaceholders): string | undefined {
  const base = typeof document !== 'undefined' ? document.baseURI : undefined;

  if (typeof loader.tokenUrl === 'string' && loader.tokenUrl) {
    try {
      return new URL(interpolatePlaceholders(loader.tokenUrl, placeholders), base).href;
    } catch {
      return undefined;
    }
  }

  for (const value of Object.values(loader.attributes ?? {})) {
    if (typeof value !== 'string' || !value.includes('{cid}')) {
      continue;
    }
    try {
      return new URL('token', new URL(interpolatePlaceholders(value, placeholders), base)).href;
    } catch {
      // not a URL-bearing attribute
    }
  }

  return undefined;
}

/** Does this loader reference anything we would substitute? */
function isTemplated(loader: ProtectLoader): boolean {
  if (typeof loader.tokenUrl === 'string' && HAS_PLACEHOLDER_REGEX.test(loader.tokenUrl)) {
    return true;
  }
  return Object.values(loader.attributes ?? {}).some(
    value => typeof value === 'string' && HAS_PLACEHOLDER_REGEX.test(value),
  );
}

export class ProtectSession {
  /** `null` when the platform has no CSPRNG — we then report `unsupported`. */
  readonly #pid: string | null;
  readonly #rid: string | null;
  readonly #cid: string | null;
  readonly #placeholders: ProtectPlaceholders;
  /** The loader the token is acquired against, and whose `error` event means `script_error`. */
  readonly #tokenLoader?: ProtectLoader;
  /** Absent when the instance has not configured the gate; we then report nothing at all. */
  readonly #tokenUrl?: string;
  readonly #timeoutMs: number;
  readonly #lock = SafeLock(ACQUISITION_LOCK_KEY);

  /**
   * Memoised: one attempt per page load. Sign-ins after a failure read this instead of re-paying
   * the deadline.
   */
  #acquisition?: Promise<ProtectStatus>;
  #scriptError = false;
  #pollAbort?: AbortController;

  /**
   * Returns a session only when at least one loader references a placeholder — an instance not
   * using the correlation id keeps today's behaviour exactly, and stores nothing in the browser.
   */
  static create(loaders: ProtectLoader[], instanceId?: string): ProtectSession | undefined {
    const templated = loaders.filter(isTemplated);
    if (templated.length === 0) {
      return undefined;
    }
    return new ProtectSession(templated, instanceId);
  }

  private constructor(templatedLoaders: ProtectLoader[], instanceId?: string) {
    this.#pid = readOrMintPid();
    this.#rid = this.#pid ? random128() : null;
    this.#cid = this.#pid && this.#rid ? buildCid(this.#pid, this.#rid) : null;

    this.#placeholders = {
      ...(this.#cid ? { cid: this.#cid } : {}),
      ...(this.#pid ? { pid: this.#pid } : {}),
      ...(this.#rid ? { rid: this.#rid } : {}),
      ...(instanceId ? { instance_id: instanceId } : {}),
    };

    let tokenLoader: ProtectLoader | undefined;
    let tokenUrl: string | undefined;
    for (const loader of templatedLoaders) {
      tokenUrl = resolveTokenUrl(loader, this.#placeholders);
      if (tokenUrl) {
        tokenLoader = loader;
        break;
      }
    }

    this.#tokenLoader = tokenLoader;
    this.#tokenUrl = tokenUrl;
    this.#timeoutMs =
      typeof tokenLoader?.tokenTimeoutMs === 'number' && tokenLoader.tokenTimeoutMs > 0
        ? tokenLoader.tokenTimeoutMs
        : DEFAULT_TOKEN_TIMEOUT_MS;
  }

  placeholders(): ProtectPlaceholders {
    return this.#placeholders;
  }

  isTokenLoader(loader: ProtectLoader): boolean {
    return this.#tokenLoader === loader;
  }

  /**
   * A loader that fails to load means there is nothing to acquire against, so there is no point
   * paying the poll deadline: abort and report `script_error`.
   */
  observeLoaderElement(element: Element): void {
    element.addEventListener(
      'error',
      () => {
        this.#scriptError = true;
        this.#pollAbort?.abort();
      },
      { once: true },
    );
  }

  /**
   * True when a token from this browser session is already shared with us — acquisition has
   * already happened and the loader does not need injecting again.
   */
  hasFreshToken(): boolean {
    return this.#tokenUrl ? readStoredToken(TOKEN_REFRESH_MARGIN_MS) !== null : false;
  }

  /** Fire-and-forget; started at `Clerk.load()` so a sign-in normally finds the token cached. */
  start(): void {
    if (!this.#tokenUrl || this.#acquisition) {
      return;
    }
    this.#acquisition = this.#acquire();
  }

  async getRequestParams(): Promise<ProtectRequestParams | undefined> {
    if (!this.#tokenUrl) {
      // The instance interpolates the id into its loader but has not configured the token
      // endpoint, so there is nothing to report.
      return undefined;
    }

    if (!this.#cid || !this.#pid) {
      return { __clerk_protect_status: 'unsupported' };
    }

    const status = (await this.#acquisition) ?? 'timeout';

    // Re-read: another tab may have completed a run after ours gave up.
    const stored = readStoredToken(0);
    if (stored) {
      return {
        __clerk_protect_token: stored.token,
        __clerk_protect_status: 'ok',
        // The cid has to name the run the token was minted for, not necessarily ours.
        __clerk_protect_cid: buildCid(this.#pid, stored.rid),
      };
    }

    return {
      // `ok` without a token would contradict itself; the token lapsed between the run and now.
      __clerk_protect_status: status === 'ok' ? 'timeout' : status,
      __clerk_protect_cid: this.#cid,
    };
  }

  async #acquire(): Promise<ProtectStatus> {
    if (!this.#cid) {
      return 'unsupported';
    }
    if (readStoredToken(TOKEN_REFRESH_MARGIN_MS)) {
      // Step 1: valid and not near expiry. No lock, no network.
      return 'ok';
    }

    const result = await this.#lock.acquireLockAndRun(async () => {
      // Double-checked inside the lock. Without this re-read every tab acquires in turn,
      // which is the exact failure this design exists to prevent.
      if (readStoredToken(TOKEN_REFRESH_MARGIN_MS)) {
        return 'ok' satisfies ProtectStatus;
      }
      return await this.#poll();
    });

    if (typeof result === 'string') {
      return result as ProtectStatus;
    }

    // The lock was never held — `SafeLock` gives up waiting after ~5s so a wedged leader delays
    // nobody. Whatever a leader did manage to write is still ours to use.
    if (readStoredToken(TOKEN_REFRESH_MARGIN_MS)) {
      return 'ok';
    }
    return this.#scriptError ? 'script_error' : 'timeout';
  }

  /** Polls the token endpoint until the deadline. Never rejects. */
  async #poll(): Promise<ProtectStatus> {
    const url = this.#tokenUrl as string;
    const deadline = Date.now() + this.#timeoutMs;
    const controller = new AbortController();
    const deadlineTimer = setTimeout(() => controller.abort(), this.#timeoutMs);
    this.#pollAbort = controller;

    try {
      while (!this.#scriptError) {
        if (Date.now() >= deadline) {
          return 'timeout';
        }

        let response: Response;
        try {
          // No custom headers, no credentials: a CORS-simple GET needs no preflight.
          response = await fetch(url, { credentials: 'omit', signal: controller.signal });
        } catch {
          if (this.#scriptError) {
            break;
          }
          return controller.signal.aborted ? 'timeout' : 'fetch_error';
        }

        if (response.status === 200) {
          const token = await readTokenPayload(response, this.#rid as string);
          if (!token) {
            return 'fetch_error';
          }
          writeStoredToken(token);
          return 'ok';
        }

        if (response.status !== 202) {
          return httpStatus(response.status);
        }

        // Still pending. The server tells us how long to wait; we bound what we honour.
        const delay = await readRetryDelay(response);
        if (Date.now() + delay >= deadline) {
          return 'timeout';
        }
        await sleep(delay, controller.signal);
      }

      return 'script_error';
    } finally {
      clearTimeout(deadlineTimer);
      this.#pollAbort = undefined;
    }
  }
}

async function readTokenPayload(response: Response, rid: string): Promise<StoredToken | null> {
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return null;
  }

  if (!json || typeof json !== 'object') {
    return null;
  }

  const { token, exp } = json as Record<string, unknown>;
  if (typeof token !== 'string' || !token) {
    return null;
  }
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return null;
  }

  return { token, exp, rid };
}

async function readRetryDelay(response: Response): Promise<number> {
  try {
    const json = (await response.json()) as Record<string, unknown> | null;
    const retryInMs = json?.retry_in_ms;
    if (typeof retryInMs === 'number' && Number.isFinite(retryInMs)) {
      return Math.min(Math.max(retryInMs, MIN_RETRY_DELAY_MS), MAX_RETRY_DELAY_MS);
    }
  } catch {
    // fall through to the default backoff
  }
  return MIN_RETRY_DELAY_MS * 2;
}
