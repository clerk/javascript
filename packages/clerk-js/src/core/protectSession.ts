import type { ProtectLoader } from '@clerk/shared/types';

import { SafeLock } from './auth/safeLock';

/**
 * Correlation id and Protect session token acquisition.
 *
 * The browser mints an opaque correlation id (`cid`) and hands it to the loader through the
 * element's attributes, which are per-instance server config. The server mints a signed session
 * token while serving that loader and returns it inline on the script's own global, so the gate
 * costs no extra round trip. We acquire it exactly once per browser session across all tabs and
 * attach it to sign-in and sign-up requests.
 *
 * An instance that configures `tokenUrl` gets the upgrade mint instead: a `GET` for a token that
 * attests to work happening after the script runs. Only that path can report `fetch_error` or
 * `http_<n>`.
 *
 * Acquisition failure is never fatal: a structured status travels in the token's place so that
 * a blocked or failed acquisition becomes a reportable fact rather than silence.
 */

/** Persistent, per-app-origin client id. Opaque and random — nothing about the device. */
const PID_STORAGE_KEY = '__clerk_protect_pid';
/** The shared `{ token, exp, rid }` store every tab reads before it considers acquiring. */
const TOKEN_STORAGE_KEY = '__clerk_protect_st';
const ACQUISITION_LOCK_KEY = 'clerk.lock.protectSessionToken';

/** Where the loader script leaves the token it was served with. */
const INLINE_TOKEN_GLOBAL = '__clerk_specter';

/** A token this close to expiry is treated as absent, so a fresh run starts before it lapses. */
const TOKEN_REFRESH_MARGIN_MS = 60 * 1_000;
/** Acquisition deadline when the instance does not configure one. */
const DEFAULT_TOKEN_TIMEOUT_MS = 5 * 1_000;
/** Ceiling on the instance-configured deadline, so no server value can stall a sign-in. */
const MAX_TOKEN_TIMEOUT_MS = 10 * 1_000;
/** A stored token claiming more remaining life than this was not minted by us. */
const MAX_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1_000;
/** Longest token we will hand back, so a planted store entry cannot bloat a sign-in body. */
const MAX_TOKEN_LENGTH = 4_096;
/**
 * The shape of a mint: `v<n>.<payload>.<mac>`, base64url. Version-agnostic on purpose — the server
 * may mint a version this build predates, and only the server can judge a token either way.
 */
const TOKEN_SHAPE = /^v\d+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
/** How long a settled, tokenless acquisition is reused before a fresh run is allowed. */
const REACQUIRE_COOLDOWN_MS = 30 * 1_000;
/**
 * Ceiling on the backoff between tokenless attempts. The cooldown doubles per consecutive failure
 * so a Specter outage costs a bounded number of deadlines instead of one every cooldown window,
 * and this stops it growing past the point where a recovered Specter would go unnoticed.
 */
const MAX_REACQUIRE_COOLDOWN_MS = 15 * 60 * 1_000;
/** A token this close to expiry is not worth sending — it would lapse before it was verified. */
const TOKEN_SEND_MARGIN_MS = 5 * 1_000;
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
const PLACEHOLDER_REGEX = /\{(cid|pid|rid|sdkver)\}/g;
/** Non-global twin of the above, so `test` does not carry `lastIndex` between calls. */
const HAS_PLACEHOLDER_REGEX = /\{(?:cid|pid|rid|sdkver)\}/;
/** The placeholders that need a minted, persisted client id to substitute. */
const HAS_CLIENT_ID_REGEX = /\{(?:cid|pid|rid)\}/;
/** Only the correlation id binds a loader to an acquisition run, so only it names the token loader. */
const HAS_CID_REGEX = /\{cid\}/;

/**
 * Closed set — FAPI validates these by exact match and drops anything else, so a new value here
 * is a wire change. `fetch_error` and `http_<n>` are reachable only through the upgrade mint.
 */
export type ProtectStatus =
  | 'ok'
  | 'no_token'
  | 'timeout'
  | 'script_error'
  | 'fetch_error'
  | 'unsupported'
  | `http_${number}`;

export type ProtectPlaceholders = {
  cid?: string;
  pid?: string;
  rid?: string;
  sdkver?: string;
};

/** The params attached to the form-encoded body of sign-in and sign-up POSTs. */
export type ProtectRequestParams = {
  __clerk_protect_token?: string;
  __clerk_protect_status: ProtectStatus;
  __clerk_protect_cid?: string;
};

/** Appends a loader element to the document and returns it, or `undefined` when it cannot. */
export type ApplyLoader = (loader: ProtectLoader, placeholders: ProtectPlaceholders) => HTMLElement | undefined;

type StoredToken = {
  token: string;
  /** Unix seconds, as served by the token endpoint. */
  exp: number;
  rid: string;
  /**
   * Local milliseconds at the moment we stored it. `exp` compares server truth against this
   * browser's clock, so a skewed clock either ships lapsed tokens or discards good ones; this
   * bounds both by elapsed local time, which is measured entirely on the one clock.
   */
  at: number;
  /**
   * The `tokens_invalid_before` in force when this was acquired. Raising the configured value
   * strands every entry stamped with an older one, so a bad mint or a key roll is recovered from
   * in minutes rather than over the token's full lifetime.
   */
  floor: number;
};

/**
 * A token as it arrives from a mint, before it is stored. `at` and `floor` are stamped by the
 * write rather than carried from here, so the two states are different types and a producer
 * cannot forget either.
 */
type MintedToken = Omit<StoredToken, 'at' | 'floor'>;

type LoaderOutcome = 'loaded' | 'error' | 'timeout';

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

/** Test-only: the fallback outlives any single session, so a suite has to be able to clear it. */
export function __internal_resetProtectStorage(): void {
  memoryStore.clear();
}

function localStorageOrNull(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readStored(key: string): string | null {
  try {
    const value = localStorageOrNull()?.getItem(key);
    if (typeof value === 'string') {
      return value;
    }
  } catch {
    // blocked — the in-memory fallback below is the only copy there is
  }
  // Reached when storage is absent, blocked, or readable but not writable: a write that hit the
  // quota landed in memory instead, and this is the only place it can be read back from.
  return memoryStore.get(key) ?? null;
}

function writeStored(key: string, value: string): void {
  try {
    const storage = localStorageOrNull();
    if (storage) {
      storage.setItem(key, value);
      memoryStore.delete(key);
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
 * the request path takes anything not yet expired. `floor` is the instance's currently configured
 * `tokens_invalid_before`; an entry acquired under an older one is stranded.
 */
function readStoredToken(key: string, marginMs: number, floor: number): StoredToken | null {
  const raw = readStored(key);
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

  const { token, exp, rid, at, floor: storedFloor } = parsed as Record<string, unknown>;
  if (typeof rid !== 'string' || !BASE32_128_REGEX.test(rid)) {
    return null;
  }
  if (!freshByLocalClock(at)) {
    return null;
  }
  // An entry with no floor predates the mechanism and counts as zero, so an instance that has
  // never set one keeps its cached tokens rather than re-acquiring on every browser at once.
  if (normalizeFloor(storedFloor) < floor) {
    return null;
  }

  const validated = validateToken(token, exp, marginMs);
  return validated ? { ...validated, rid, at: at as number, floor: normalizeFloor(storedFloor) } : null;
}

/** A floor is unix seconds; anything else configured or stored is treated as no floor at all. */
function normalizeFloor(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * The clock-skew bound. `exp` is server truth compared against this browser's clock, so a clock
 * running slow keeps an entry alive long past its real expiry and a clock running fast throws
 * good ones away. Elapsed time since we stored it is measured on one clock, so a constant offset
 * cancels: an entry older than any token we would ever be issued is stale whatever `exp` claims,
 * and one stamped in the future means the clock moved backwards under us.
 *
 * This bounds the damage rather than removing it — a fully skew-proof check needs the server to
 * send a relative lifetime instead of an absolute `exp`, which is a wire change.
 */
function freshByLocalClock(at: unknown): boolean {
  if (typeof at !== 'number' || !Number.isFinite(at)) {
    return false;
  }
  const elapsed = Date.now() - at;
  return elapsed >= 0 && elapsed < MAX_TOKEN_LIFETIME_MS;
}

/**
 * The store is writable by anything running on the origin, so a value that could not have come
 * from a mint of ours is discarded rather than trusted to suppress the loaders.
 *
 * The shape check is hygiene, not a security boundary: only the server can tell a real token from a
 * well-formed forgery, and anything that can write the store can send the same values to the API
 * directly. What it buys is that a corrupt or truncated entry starts a fresh run immediately
 * instead of suppressing acquisition until it expires.
 */
function validateToken(token: unknown, exp: unknown, marginMs: number): { token: string; exp: number } | null {
  if (typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH || !TOKEN_SHAPE.test(token)) {
    return null;
  }
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return null;
  }
  const expMs = exp * 1_000;
  if (expMs - marginMs <= Date.now() || expMs > Date.now() + MAX_TOKEN_LIFETIME_MS) {
    return null;
  }
  return { token, exp };
}

/** `at` and `floor` are the writer's business, not the caller's — both stamped here, at the write. */
function writeStoredToken(key: string, value: MintedToken, floor: number): void {
  writeStored(key, JSON.stringify({ ...value, at: Date.now(), floor }));
}

/** Sentinel for "the deadline won", distinguishable from anything `ready` could resolve to. */
const DEADLINE = Symbol('deadline');

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/** `ready` never rejects by contract; a rejection is still treated as nothing served. */
function settleWithin(ready: PromiseLike<unknown>, deadline: number): Promise<unknown> {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(DEADLINE), Math.max(0, deadline - Date.now()));
    const settle = (value: unknown) => {
      clearTimeout(timer);
      resolve(value);
    };
    ready.then(settle, () => settle(null));
  });
}

/**
 * The token the loader script was served with, or the status that stands in for it.
 *
 * The current shape carries `ready`, a promise resolving to `{ token, exp }` or to
 * `{ status: 'no_token' }`. It is the loader's completion signal and the seam where page-side
 * work will later live, so the token is awaited rather than read. The base shape carries neither
 * `cid` nor `ready` and lands on `no_token` — which is why that status exists separately from
 * `timeout`: until the server half deploys it is the correct answer for every load, and calling
 * that a timeout would make a normal rollout look like an outage.
 */
async function readInlineToken(cid: string, rid: string, deadline: number): Promise<MintedToken | ProtectStatus> {
  const inline = (globalThis as unknown as Record<string, unknown>)[INLINE_TOKEN_GLOBAL];
  if (!inline || typeof inline !== 'object') {
    return 'no_token';
  }

  const { cid: mintedFor, ready } = inline as Record<string, unknown>;
  // The global is page-visible and outlives a navigation, so a token minted for anyone else's run
  // is not ours to send. The base shape, which carries no cid at all, lands here too.
  if (mintedFor !== cid || !isThenable(ready)) {
    return 'no_token';
  }

  const resolved = await settleWithin(ready, deadline);
  if (resolved === DEADLINE) {
    return 'timeout';
  }
  if (!resolved || typeof resolved !== 'object') {
    return 'no_token';
  }

  const { token, exp } = resolved as Record<string, unknown>;
  const validated = validateToken(token, exp, 0);
  // `{ status: 'no_token' }` has no token to validate and lands here, as does a malformed one.
  return validated ? { ...validated, rid } : 'no_token';
}

function httpStatus(status: number): ProtectStatus {
  // The status enum only admits `http_1xx`-`http_5xx`; anything else would be dropped by FAPI.
  return status >= 100 && status <= 599 ? (`http_${status}` as ProtectStatus) : 'fetch_error';
}

/** Worth spending the rest of the deadline on rather than reporting as the outcome. */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
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

/** Resolves to `timeout` rather than waiting past `ms`, and never rejects. */
function withDeadline(promise: Promise<ProtectStatus>, ms: number): Promise<ProtectStatus> {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve('timeout'), ms);
    const settle = (status: ProtectStatus) => {
      clearTimeout(timer);
      resolve(status);
    };
    promise.then(settle, () => settle('timeout'));
  });
}

/** Every string a loader can carry a placeholder in. */
function templatedValues(loader: ProtectLoader): string[] {
  const values: string[] = [];
  if (typeof loader.token_url === 'string') {
    values.push(loader.token_url);
  }
  if (typeof loader.text_content === 'string') {
    values.push(loader.text_content);
  }
  for (const value of Object.values(loader.attributes ?? {})) {
    if (typeof value === 'string') {
      values.push(value);
    }
  }
  return values;
}

/** Does this loader reference anything we would substitute? */
function isTemplated(loader: ProtectLoader): boolean {
  return templatedValues(loader).some(value => HAS_PLACEHOLDER_REGEX.test(value));
}

/** Does this loader need the persisted client id, as opposed to only the instance id? */
function needsClientId(loader: ProtectLoader): boolean {
  return templatedValues(loader).some(value => HAS_CLIENT_ID_REGEX.test(value));
}

function isCorrelated(loader: ProtectLoader): boolean {
  return templatedValues(loader).some(value => HAS_CID_REGEX.test(value));
}

/**
 * Will this element fetch, and so eventually fire `load` or `error`? A classic inline script will
 * not — it runs during `appendChild` and reports through neither event. An inline module will: it
 * evaluates off a module graph the browser still has to fetch.
 */
function isFetching(element: HTMLElement): boolean {
  if (element.getAttribute('src') || element.getAttribute('href')) {
    return true;
  }
  return element.tagName === 'SCRIPT' && element.getAttribute('type')?.toLowerCase() === 'module';
}

export class ProtectSession {
  /** `null` when no loader needs it, or when the platform has no CSPRNG. */
  readonly #pid: string | null;
  readonly #rid: string | null;
  readonly #cid: string | null;
  readonly #placeholders: ProtectPlaceholders;
  /** The loader carrying the correlation id; absent when the instance has not configured the gate. */
  readonly #tokenLoader?: ProtectLoader;
  /** Set only by an instance opting into the upgrade mint. */
  readonly #tokenUrl?: string;
  readonly #timeoutMs: number;
  readonly #applyLoader: ApplyLoader;
  /**
   * One store per origin. The token is scoped to the instance that minted it and is verified
   * server-side, so an origin serving two instances costs a rejected token, never a wrong grant.
   */
  /** Currently configured `tokens_invalid_before`; 0 when the instance has never set one. */
  readonly #floor: number = 0;
  readonly #tokenStorageKey: string;
  readonly #lock: ReturnType<typeof SafeLock>;

  /** One attempt at a time; re-armed once it has settled without leaving a usable token. */
  #acquisition?: Promise<ProtectStatus>;
  #acquisitionSettled = false;
  #lastAttemptAt = 0;
  /** Consecutive attempts that settled without a usable token. Drives the re-acquire backoff. */
  #consecutiveFailures = 0;

  /**
   * Returns a session only when at least one loader references a placeholder — an instance using
   * none of them is unaffected.
   */
  static create(
    loaders: ProtectLoader[],
    applyLoader: ApplyLoader,
    tokensInvalidBefore?: number,
  ): ProtectSession | undefined {
    const templated = loaders.filter(isTemplated);
    if (templated.length === 0) {
      return undefined;
    }
    return new ProtectSession(templated, applyLoader, tokensInvalidBefore);
  }

  private constructor(templatedLoaders: ProtectLoader[], applyLoader: ApplyLoader, tokensInvalidBefore?: number) {
    this.#applyLoader = applyLoader;
    this.#floor = normalizeFloor(tokensInvalidBefore);

    // Nothing is persisted for a loader that only templates the SDK version: that needs no minted
    // identity, so minting one would plant a durable id nobody asked for.
    const clientIdNeeded = templatedLoaders.some(needsClientId);
    this.#pid = clientIdNeeded ? readOrMintPid() : null;
    this.#rid = this.#pid ? random128() : null;
    this.#cid = this.#pid && this.#rid ? buildCid(this.#pid, this.#rid) : null;

    this.#placeholders = {
      ...(this.#cid ? { cid: this.#cid } : {}),
      ...(this.#pid ? { pid: this.#pid } : {}),
      ...(this.#rid ? { rid: this.#rid } : {}),
      // Sending a version is what tells the server this build interpolates placeholders at all,
      // and so can be served the current shape. A build that leaves it verbatim gets the base one.
      sdkver: __PKG_VERSION__,
    };

    const tokenLoader = templatedLoaders.find(isCorrelated);
    this.#tokenLoader = tokenLoader;
    this.#tokenUrl = tokenLoader ? resolveTokenUrl(tokenLoader, this.#placeholders) : undefined;
    this.#timeoutMs = clampTimeout(tokenLoader?.token_timeout_ms);

    this.#tokenStorageKey = TOKEN_STORAGE_KEY;
    this.#lock = SafeLock(ACQUISITION_LOCK_KEY);
  }

  placeholders(): ProtectPlaceholders {
    return this.#placeholders;
  }

  /** The session owns this loader's injection, so `Protect` must not apply it as well. */
  isTokenLoader(loader: ProtectLoader): boolean {
    return this.#tokenLoader === loader;
  }

  /** Fire-and-forget; started at `Clerk.load()` so a sign-in normally finds the token cached. */
  start(): void {
    if (!this.#tokenLoader || this.#acquisition) {
      return;
    }
    this.#startAcquisition();
  }

  async getRequestParams(): Promise<ProtectRequestParams | undefined> {
    if (!this.#tokenLoader) {
      // The instance interpolates an id into its loader but has not configured the gate, so there
      // is nothing to report.
      return undefined;
    }

    if (!this.#cid || !this.#pid) {
      return { __clerk_protect_status: 'unsupported' };
    }

    this.#rearmIfStale();
    const status = this.#acquisition ? await withDeadline(this.#acquisition, this.#timeoutMs) : 'timeout';

    // Re-read: another tab may have completed a run after ours gave up. The send margin is what
    // stops us shipping a token with a second of life left, which could only fail verification.
    const stored = readStoredToken(this.#tokenStorageKey, TOKEN_SEND_MARGIN_MS, this.#floor);
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

  /**
   * True when a token from this browser session is already shared with us. Only the token loader
   * is skipped on the strength of it — every other loader still runs on every page load.
   */
  hasFreshToken(): boolean {
    return this.#tokenLoader ? this.#freshStoredToken() !== null : false;
  }

  #freshStoredToken(): StoredToken | null {
    return readStoredToken(this.#tokenStorageKey, TOKEN_REFRESH_MARGIN_MS, this.#floor);
  }

  /**
   * A page outlives its token. Once an attempt has settled without leaving one usable, the next
   * sign-in starts a fresh run instead of replaying a stale result for the life of the tab.
   */
  #rearmIfStale(): void {
    if (!this.#acquisition) {
      this.#startAcquisition();
      return;
    }
    if (!this.#acquisitionSettled) {
      return;
    }
    if (readStoredToken(this.#tokenStorageKey, TOKEN_SEND_MARGIN_MS, this.#floor)) {
      return;
    }
    if (Date.now() - this.#lastAttemptAt < this.#backoffMs()) {
      return;
    }
    this.#startAcquisition();
  }

  /**
   * How long to wait before another attempt, doubling per consecutive tokenless one. A flat
   * cooldown means a Specter outage adds the full deadline to a sign-in every cooldown window,
   * for as long as the outage lasts — which is the auth-critical-path cost landing exactly when
   * things are already worst. The ceiling keeps a long-lived tab noticing a recovery.
   */
  #backoffMs(): number {
    if (this.#consecutiveFailures <= 1) {
      return REACQUIRE_COOLDOWN_MS;
    }
    // 2 ** n overflows to Infinity long before it matters; Math.min still yields the ceiling.
    return Math.min(REACQUIRE_COOLDOWN_MS * 2 ** (this.#consecutiveFailures - 1), MAX_REACQUIRE_COOLDOWN_MS);
  }

  #startAcquisition(): void {
    this.#lastAttemptAt = Date.now();
    this.#acquisitionSettled = false;
    const settled = (status: ProtectStatus): ProtectStatus => {
      this.#acquisitionSettled = true;
      // Judged on whether a token landed, not on the status: another tab may have won the lock
      // and written one while this attempt reported `timeout`, and that is not a failure.
      this.#consecutiveFailures = readStoredToken(this.#tokenStorageKey, TOKEN_SEND_MARGIN_MS, this.#floor)
        ? 0
        : this.#consecutiveFailures + 1;
      return status;
    };
    this.#acquisition = this.#acquire().then(settled, () => settled('timeout'));
  }

  async #acquire(): Promise<ProtectStatus> {
    if (!this.#cid) {
      return 'unsupported';
    }
    if (this.#freshStoredToken()) {
      // Step 1: valid and not near expiry. No lock, no loader, no network.
      return 'ok';
    }

    const result = await this.#lock.acquireLockAndRun(async () => {
      // Double-checked inside the lock. Without this re-read every tab runs the loader in turn,
      // which is the exact failure this design exists to prevent.
      if (this.#freshStoredToken()) {
        return 'ok' satisfies ProtectStatus;
      }
      return await this.#mint();
    });

    if (typeof result === 'string') {
      return result as ProtectStatus;
    }

    // The lock was never held — `SafeLock` gives up waiting after ~5s so a wedged leader delays
    // nobody. Whatever a leader did manage to write is still ours to use.
    return this.#freshStoredToken() ? 'ok' : 'timeout';
  }

  /** Runs the loader and takes the token it was served with. Never rejects. */
  async #mint(): Promise<ProtectStatus> {
    const deadline = Date.now() + this.#timeoutMs;

    const outcome = await this.#runTokenLoader(deadline);
    if (outcome === 'error') {
      return 'script_error';
    }
    if (outcome === 'timeout') {
      return 'timeout';
    }

    if (this.#tokenUrl) {
      return await this.#poll(deadline);
    }

    const inline = await readInlineToken(this.#cid as string, this.#rid as string, deadline);
    if (typeof inline === 'string') {
      return inline;
    }

    writeStoredToken(this.#tokenStorageKey, inline, this.#floor);
    return 'ok';
  }

  /**
   * Injects the token loader and settles on whichever of `load`, `error` or the deadline comes
   * first, or immediately when the element has nothing to fetch.
   */
  #runTokenLoader(deadline: number): Promise<LoaderOutcome> {
    const loader = this.#tokenLoader;
    if (!loader) {
      return Promise.resolve('error');
    }

    let element: HTMLElement | undefined;
    try {
      element = this.#applyLoader(loader, this.#placeholders);
    } catch {
      return Promise.resolve('error');
    }
    if (!element) {
      return Promise.resolve('error');
    }

    // An element that fetches nothing fires neither `load` nor `error`, and a classic inline script
    // has already executed by the time it was appended. Waiting for an event that cannot arrive
    // would spend the whole deadline and then discard the token the script body had assigned before
    // we ever looked. An inline module is the exception: it evaluates off a fetched graph, so its
    // `load` does arrive and settling early would read the global before it is written.
    if (!isFetching(element)) {
      return Promise.resolve('loaded');
    }

    return new Promise<LoaderOutcome>(resolve => {
      const timer = setTimeout(() => resolve('timeout'), Math.max(0, deadline - Date.now()));
      const settle = (outcome: LoaderOutcome) => () => {
        clearTimeout(timer);
        resolve(outcome);
      };
      element.addEventListener('load', settle('loaded'), { once: true });
      element.addEventListener('error', settle('error'), { once: true });
    });
  }

  /** The upgrade mint: polls the token endpoint until the deadline. Never rejects. */
  async #poll(deadline: number): Promise<ProtectStatus> {
    const url = this.#tokenUrl as string;
    const controller = new AbortController();
    const deadlineTimer = setTimeout(() => controller.abort(), Math.max(0, deadline - Date.now()));

    try {
      for (;;) {
        if (Date.now() >= deadline) {
          return 'timeout';
        }

        let response: Response;
        try {
          // No custom headers, no credentials: a CORS-simple GET needs no preflight.
          response = await fetch(url, { credentials: 'omit', signal: controller.signal });
        } catch {
          return controller.signal.aborted ? 'timeout' : 'fetch_error';
        }

        if (response.status === 200) {
          const token = await readTokenPayload(response, this.#rid as string);
          if (!token) {
            return 'fetch_error';
          }
          writeStoredToken(this.#tokenStorageKey, token, this.#floor);
          return 'ok';
        }

        const pending = response.status === 202;
        if (!pending && !isRetryableStatus(response.status)) {
          return httpStatus(response.status);
        }

        // Still pending, or transiently unavailable. Spending the remaining deadline on a retry
        // beats reporting a blip as the outcome for the whole page.
        const delay = pending ? await readRetryDelay(response) : MIN_RETRY_DELAY_MS * 4;
        if (Date.now() + delay >= deadline) {
          return pending ? 'timeout' : httpStatus(response.status);
        }
        await sleep(delay, controller.signal);
      }
    } finally {
      clearTimeout(deadlineTimer);
    }
  }
}

export function clampTimeout(configured: unknown): number {
  if (typeof configured !== 'number' || !Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_TOKEN_TIMEOUT_MS;
  }
  return Math.min(configured, MAX_TOKEN_TIMEOUT_MS);
}

/**
 * The upgrade mint's endpoint, for an instance that has opted into it. It is instance config like
 * every other part of the loader, so a new placement ships without an SDK release. Absent it, the
 * token arrives inline with the loader and there is no endpoint to resolve.
 */
function resolveTokenUrl(loader: ProtectLoader, placeholders: ProtectPlaceholders): string | undefined {
  if (typeof loader.token_url !== 'string' || !loader.token_url) {
    return undefined;
  }

  const base = typeof document !== 'undefined' ? document.baseURI : undefined;
  try {
    return new URL(interpolatePlaceholders(loader.token_url, placeholders), base).href;
  } catch {
    return undefined;
  }
}

async function readTokenPayload(response: Response, rid: string): Promise<MintedToken | null> {
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
  const validated = validateToken(token, exp, 0);
  return validated ? { ...validated, rid } : null;
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
