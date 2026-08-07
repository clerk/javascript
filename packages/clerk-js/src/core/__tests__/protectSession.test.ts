import type { ProtectLoader } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import type { ApplyLoader } from '../protectSession';
import {
  __internal_resetProtectStorage,
  buildCid,
  CID_REGEX,
  clampTimeout,
  encodeBase32,
  interpolatePlaceholders,
  ProtectSession,
} from '../protectSession';

const LOADER_SRC = 'https://loader.example.com/ins_2abc/{cid}/loader.js';

/**
 * No `src` by default: jsdom runs with `resources: 'usable'`, so a real URL is actually fetched
 * and fires `error` on its own schedule, racing the events these tests need to drive themselves.
 */
const loader = (overrides: Partial<ProtectLoader> = {}): ProtectLoader => ({
  target: 'head',
  type: 'script',
  attributes: { 'data-cid': '{cid}' },
  tokenTimeoutMs: 200,
  ...overrides,
});

const nowSeconds = () => Math.floor(Date.now() / 1_000);
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Stands in for `Protect.applyLoader`, handing the test the element the session is waiting on so
 * it can play the part of the browser and fire `load` or `error`.
 */
const harness = () => {
  const elements: HTMLElement[] = [];
  const applyLoader: ApplyLoader = (config, placeholders) => {
    const element = document.createElement(config.type || 'script');
    for (const [key, value] of Object.entries(config.attributes ?? {})) {
      element.setAttribute(key, interpolatePlaceholders(String(value), placeholders));
    }
    document.head.appendChild(element);
    elements.push(element);
    return element;
  };

  const injected = async (count = 1): Promise<HTMLElement> => {
    for (let i = 0; i < 100 && elements.length < count; i++) {
      await tick();
    }
    return elements[count - 1];
  };

  return { applyLoader, elements, injected };
};

const session = (loaders: ProtectLoader[], instanceId?: string) => {
  const h = harness();
  return { session: ProtectSession.create(loaders, instanceId, h.applyLoader), ...h };
};

/** What the server does: the script body assigns the global, then the element fires `load`. */
const serveInline = (element: HTMLElement, overrides: Record<string, unknown> = {}) => {
  (globalThis as unknown as Record<string, unknown>).__clerk_specter = {
    v: 3,
    id: '11111111-2222-3333-4444-555555555555',
    ready: Promise.resolve({ token: 'v1.payload.mac', exp: nowSeconds() + 43_200 }),
    ...overrides,
  };
  element.dispatchEvent(new Event('load'));
};

/** The shape served to a build that asserts no version: no cid, no `ready`. */
const serveBaseShape = (element: HTMLElement) => {
  (globalThis as unknown as Record<string, unknown>).__clerk_specter = {
    v: 1,
    id: '11111111-2222-3333-4444-555555555555',
  };
  element.dispatchEvent(new Event('load'));
};

const tokenResponse = (token = 'v1.payload.mac', expInSeconds = nowSeconds() + 43_200) => ({
  status: 200,
  json: () => Promise.resolve({ token, exp: expInSeconds }),
});

const retryResponse = (retryInMs = 10) => ({
  status: 202,
  json: () => Promise.resolve({ retry_in_ms: retryInMs }),
});

const errorResponse = (status: number) => ({
  status,
  json: () => Promise.resolve({ status: 'unknown_cid' }),
});

const originalFetch = global.fetch;

beforeEach(() => {
  localStorage.clear();
  __internal_resetProtectStorage();
  document.head.innerHTML = '';
  delete (globalThis as unknown as Record<string, unknown>).__clerk_specter;
  global.fetch = vi.fn(() => Promise.resolve(tokenResponse())) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = originalFetch;
  localStorage.clear();
  __internal_resetProtectStorage();
  delete (globalThis as unknown as Record<string, unknown>).__clerk_specter;
});

describe('encodeBase32', () => {
  it('emits 26 lowercase unpadded base32 chars for 128 bits', () => {
    expect(encodeBase32(new Uint8Array(16))).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(encodeBase32(new Uint8Array(16).fill(0xff))).toBe('77777777777777777777777774');
  });

  it('matches the RFC 4648 alphabet', () => {
    // The canonical base32 of 0x00..0x0f is AAAQEAYEAUDAOCAJBIFQYDIOB4======
    expect(encodeBase32(Uint8Array.from({ length: 16 }, (_, i) => i))).toBe('aaaqeayeaudaocajbifqydiob4');
  });
});

describe('interpolatePlaceholders', () => {
  it('substitutes the closed set', () => {
    expect(
      interpolatePlaceholders('{instance_id}/{cid}/{pid}/{rid}', {
        cid: 'c',
        pid: 'p',
        rid: 'r',
        instance_id: 'ins_2abc',
      }),
    ).toBe('ins_2abc/c/p/r');
  });

  it('leaves an unrecognised placeholder verbatim', () => {
    expect(interpolatePlaceholders('{cid}/{nope}/{PID}', { cid: 'c' })).toBe('c/{nope}/{PID}');
  });

  it('leaves a recognised placeholder verbatim when there is no value for it', () => {
    expect(interpolatePlaceholders('{cid}/{instance_id}', { cid: 'c' })).toBe('c/{instance_id}');
  });
});

describe('ProtectSession.create', () => {
  it('returns nothing when no loader references a placeholder', () => {
    const { session: created } = session([loader({ attributes: { src: 'https://loader.example.com/loader.js' } })]);

    expect(created).toBeUndefined();
    // An instance not using the correlation id stores nothing in the user's browser.
    expect(localStorage.getItem('__clerk_protect_pid')).toBeNull();
  });

  it('mints a 55-char correlation id and persists only the pid', () => {
    const { session: created } = session([loader()]);
    const cid = created?.placeholders().cid as string;

    expect(cid).toMatch(CID_REGEX);
    expect(cid).toHaveLength(55);
    expect(localStorage.getItem('__clerk_protect_pid')).toBe(created?.placeholders().pid);
  });

  it('reuses the persisted pid and mints a fresh rid per run', () => {
    const first = session([loader()]).session?.placeholders();
    const second = session([loader()]).session?.placeholders();

    expect(second?.pid).toBe(first?.pid);
    expect(second?.rid).not.toBe(first?.rid);
    expect(buildCid(second?.pid as string, second?.rid as string)).toBe(second?.cid);
  });

  it('substitutes the instance id when one is available', () => {
    const { session: created } = session([loader()], 'ins_2abc');
    expect(created?.placeholders().instance_id).toBe('ins_2abc');
  });

  it('stores nothing for a loader that only templates the instance id', async () => {
    const { session: created, elements } = session(
      [loader({ attributes: { src: 'https://loader.example.com/{instance_id}/loader.js' } })],
      'ins_2abc',
    );

    expect(created?.placeholders().instance_id).toBe('ins_2abc');
    // The instance id needs no minted identity, so none is planted for it.
    expect(created?.placeholders().pid).toBeUndefined();
    expect(localStorage.getItem('__clerk_protect_pid')).toBeNull();

    created?.start();
    await expect(created?.getRequestParams()).resolves.toBeUndefined();
    expect(elements).toHaveLength(0);
  });

  it('reports unsupported when there is no CSPRNG', async () => {
    const originalGetRandomValues = crypto.getRandomValues;
    // @ts-expect-error -- deliberately removing the API to exercise the unsupported path
    crypto.getRandomValues = undefined;

    try {
      const { session: created, elements } = session([loader()]);
      created?.start();

      await expect(created?.getRequestParams()).resolves.toEqual({ __clerk_protect_status: 'unsupported' });
      expect(elements).toHaveLength(0);
      // Nothing usable to interpolate, so the loader keeps its literal placeholder.
      expect(created?.placeholders().cid).toBeUndefined();
    } finally {
      crypto.getRandomValues = originalGetRandomValues;
    }
  });
});

describe('ProtectSession inline token', () => {
  it('hands the correlation id to the loader it injects', async () => {
    const { session: created, injected } = session([loader({ attributes: { src: LOADER_SRC } })], 'ins_2abc');
    created?.start();

    expect((await injected()).getAttribute('src')).toBe(
      `https://loader.example.com/ins_2abc/${created?.placeholders().cid}/loader.js`,
    );
  });

  it('takes the token the loader was served with, and shares it through localStorage', async () => {
    const { session: created, injected } = session([loader()]);
    created?.start();

    serveInline(await injected(), { cid: created?.placeholders().cid });

    await expect(created?.getRequestParams()).resolves.toEqual({
      __clerk_protect_token: 'v1.payload.mac',
      __clerk_protect_status: 'ok',
      __clerk_protect_cid: created?.placeholders().cid,
    });
    expect(JSON.parse(localStorage.getItem('__clerk_protect_st') as string)).toMatchObject({
      token: 'v1.payload.mac',
      rid: created?.placeholders().rid,
    });
    // The whole point of inline delivery: no second request.
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('ignores a token minted for someone else’s run', async () => {
    const { session: created, injected } = session([loader()]);
    created?.start();

    serveInline(await injected(), { cid: buildCid('z'.repeat(26).replace(/z/g, 'a'), 'b'.repeat(26)) });

    await expect(created?.getRequestParams()).resolves.toEqual({
      __clerk_protect_status: 'no_token',
      __clerk_protect_cid: created?.placeholders().cid,
    });
  });

  it('substitutes the SDK version, which is what earns the current shape', async () => {
    const { session: created, injected } = session([
      loader({ attributes: { 'data-cid': '{cid}', 'data-v': '{sdkver}' } }),
    ]);
    created?.start();

    expect((await injected()).getAttribute('data-v')).toBe(__PKG_VERSION__);
  });

  it('reports no_token when the script publishes nothing', async () => {
    const { session: created, injected } = session([loader()]);
    created?.start();

    (await injected()).dispatchEvent(new Event('load'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'no_token' });
  });

  it('reports no_token for the base shape an older server serves', async () => {
    const { session: created, injected } = session([loader()]);
    created?.start();

    // Until the server half deploys this is the answer for every load, so it must not read as a
    // timeout — that would make a normal rollout look like an outage.
    serveBaseShape(await injected());

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'no_token' });
  });

  it('reports no_token when ready resolves without one', async () => {
    const { session: created, injected } = session([loader()]);
    created?.start();

    serveInline(await injected(), {
      cid: created?.placeholders().cid,
      ready: Promise.resolve({ status: 'no_token' }),
    });

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'no_token' });
  });

  it('reports timeout when ready never settles', async () => {
    const { session: created, injected } = session([loader({ tokenTimeoutMs: 60 })]);
    created?.start();

    serveInline(await injected(), { cid: created?.placeholders().cid, ready: new Promise(() => {}) });

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'timeout' });
  });

  it('survives a ready that rejects, which the contract says it never does', async () => {
    const rejected = Promise.reject(new Error('specter blew up'));
    rejected.catch(() => undefined);

    const { session: created, injected } = session([loader()]);
    created?.start();

    serveInline(await injected(), { cid: created?.placeholders().cid, ready: rejected });

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'no_token' });
  });

  it('reports script_error when the loader element fails to load', async () => {
    const { session: created, injected } = session([loader({ tokenTimeoutMs: 5_000 })]);
    created?.start();

    (await injected()).dispatchEvent(new Event('error'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'script_error' });
  });

  it('reports timeout when the loader never settles', async () => {
    const { session: created, injected } = session([loader({ tokenTimeoutMs: 40 })]);
    created?.start();
    await injected();

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'timeout' });
  });

  it('reuses a fresh token without injecting the loader at all', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.cached.mac', exp: nowSeconds() + 43_200, rid: 'b'.repeat(26) }),
    );

    const { session: created, elements } = session([loader()]);
    expect(created?.hasFreshToken()).toBe(true);
    created?.start();

    await expect(created?.getRequestParams()).resolves.toEqual({
      __clerk_protect_token: 'v1.cached.mac',
      __clerk_protect_status: 'ok',
      // The cid names the run the token was minted for, which is not this tab's run.
      __clerk_protect_cid: buildCid(created?.placeholders().pid as string, 'b'.repeat(26)),
    });
    expect(elements).toHaveLength(0);
  });

  it('ignores a stored token that has expired', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.stale.mac', exp: nowSeconds() - 1, rid: 'b'.repeat(26) }),
    );

    const { session: created, injected } = session([loader()]);
    expect(created?.hasFreshToken()).toBe(false);

    created?.start();
    serveInline(await injected(), { cid: created?.placeholders().cid });

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_token: 'v1.payload.mac' });
  });

  it('ignores a planted token claiming more life than we ever mint', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.planted.mac', exp: nowSeconds() + 10 * 365 * 24 * 60 * 60, rid: 'b'.repeat(26) }),
    );

    const { session: created, injected } = session([loader()]);
    // A page-writable store must not be able to suppress the loader for ever.
    expect(created?.hasFreshToken()).toBe(false);

    created?.start();
    serveInline(await injected(), { cid: created?.placeholders().cid });

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_token: 'v1.payload.mac' });
  });

  it('ignores a planted value that could never have been a mint', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'not-a-token', exp: nowSeconds() + 43_200, rid: 'b'.repeat(26) }),
    );

    const { session: created, injected } = session([loader()]);
    // Shape alone proves nothing — only the server can tell a mint from a well-formed forgery —
    // but a corrupt entry must start a fresh run rather than suppress acquisition until it expires.
    expect(created?.hasFreshToken()).toBe(false);

    created?.start();
    serveInline(await injected(), { cid: created?.placeholders().cid });

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_token: 'v1.payload.mac' });
  });

  it('reuses a mint whose version this build predates', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v9.cached.mac', exp: nowSeconds() + 43_200, rid: 'b'.repeat(26) }),
    );

    // The shape check must not pin a version. The server may mint ahead of this build, and
    // rejecting that here would re-run the loader on every page load until the SDK caught up.
    const { session: created, elements } = session([loader()]);
    expect(created?.hasFreshToken()).toBe(true);
    created?.start();

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_token: 'v9.cached.mac' });
    expect(elements).toHaveLength(0);
  });

  it('reports nothing at all for a loader that carries no correlation id', async () => {
    const { session: created, elements } = session([loader({ attributes: { 'data-pid': '{pid}' } })]);

    created?.start();
    await expect(created?.getRequestParams()).resolves.toBeUndefined();
    expect(elements).toHaveLength(0);
  });
});

describe('ProtectSession upgrade mint', () => {
  const upgrade = (overrides: Partial<ProtectLoader> = {}) =>
    loader({ tokenUrl: 'https://loader.example.com/{instance_id}/{cid}/token', ...overrides });

  it('fetches the explicitly configured endpoint once the loader has run', async () => {
    const { session: created, injected } = session([upgrade()], 'ins_2abc');
    created?.start();

    (await injected()).dispatchEvent(new Event('load'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'ok' });
    expect(global.fetch).toHaveBeenCalledWith(
      `https://loader.example.com/ins_2abc/${created?.placeholders().cid}/token`,
      expect.objectContaining({ credentials: 'omit' }),
    );
  });

  it('never derives an endpoint from a loader attribute', async () => {
    // The cid rides in a data attribute and the src is not a token endpoint; without an explicit
    // tokenUrl the inline path is the only one, so nothing is fetched.
    const { session: created, injected } = session([
      loader({ attributes: { 'data-cid': '{cid}', 'data-loader': 'https://cdn.example.com/loader.js' } }),
    ]);
    created?.start();
    serveInline(await injected(), { cid: created?.placeholders().cid });

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'ok' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('polls through a 202 until the token is minted', async () => {
    (global.fetch as Mock)
      .mockImplementationOnce(() => Promise.resolve(retryResponse()))
      .mockImplementationOnce(() => Promise.resolve(tokenResponse()));

    const { session: created, injected } = session([upgrade({ tokenTimeoutMs: 1_000 })]);
    created?.start();
    (await injected()).dispatchEvent(new Event('load'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'ok' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('spends the remaining deadline retrying a transient failure', async () => {
    (global.fetch as Mock)
      .mockImplementationOnce(() => Promise.resolve(errorResponse(503)))
      .mockImplementationOnce(() => Promise.resolve(tokenResponse()));

    const { session: created, injected } = session([upgrade({ tokenTimeoutMs: 1_000 })]);
    created?.start();
    (await injected()).dispatchEvent(new Event('load'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'ok' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('reports a non-retryable http status without retrying', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.resolve(errorResponse(400)));

    const { session: created, injected } = session([upgrade({ tokenTimeoutMs: 1_000 })]);
    created?.start();
    (await injected()).dispatchEvent(new Event('load'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'http_400' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('reports fetch_error when the token endpoint is unreachable', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));

    const { session: created, injected } = session([upgrade()]);
    created?.start();
    (await injected()).dispatchEvent(new Event('load'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'fetch_error' });
  });

  it('reports fetch_error when a 200 carries no usable token', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.resolve({ status: 200, json: () => Promise.resolve({}) }));

    const { session: created, injected } = session([upgrade()]);
    created?.start();
    (await injected()).dispatchEvent(new Event('load'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'fetch_error' });
  });
});

describe('ProtectSession storage', () => {
  it('reads back a token the quota forced into the in-memory fallback', async () => {
    // Readable but not writable — Safari private browsing, or an exhausted origin quota.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { session: created, injected } = session([loader()]);
    created?.start();
    serveInline(await injected(), { cid: created?.placeholders().cid });

    await expect(created?.getRequestParams()).resolves.toMatchObject({
      __clerk_protect_token: 'v1.payload.mac',
      __clerk_protect_status: 'ok',
    });
  });

  it('falls back to an in-memory pid when localStorage throws outright', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage is blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage is blocked');
    });

    const first = session([loader()]).session;
    const second = session([loader()]).session;

    expect(first?.placeholders().cid).toMatch(CID_REGEX);
    // The in-memory fallback still shares the pid across sessions on this page.
    expect(second?.placeholders().pid).toBe(first?.placeholders().pid);
  });

  it('does not share a token between two instances on one origin', async () => {
    const a = session([loader()], 'ins_aaa');
    a.session?.start();
    serveInline(await a.injected(), { cid: a.session?.placeholders().cid });
    await expect(a.session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'ok' });

    const b = session([loader()], 'ins_bbb');
    // Instance B must run its own loader rather than sending a token minted for instance A.
    expect(b.session?.hasFreshToken()).toBe(false);
    expect(localStorage.getItem('__clerk_protect_st.ins_aaa')).not.toBeNull();
    expect(localStorage.getItem('__clerk_protect_st.ins_bbb')).toBeNull();
  });
});

describe('ProtectSession deadlines', () => {
  it('holds a sign-in no longer than the deadline, however long acquisition takes', async () => {
    const { session: created } = session([loader({ tokenTimeoutMs: 50 })]);
    created?.start();

    const startedAt = Date.now();
    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'timeout' });
    expect(Date.now() - startedAt).toBeLessThan(1_000);
  });

  it('starts a fresh run once the cooldown has passed with no token to show for the last one', async () => {
    const { session: created, injected, elements } = session([loader({ tokenTimeoutMs: 1_000 })]);
    created?.start();
    (await injected()).dispatchEvent(new Event('error'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'script_error' });
    expect(elements).toHaveLength(1);

    // A tab outlives its token, so a settled failure must not be replayed for the life of the page.
    const realNow = Date.now();
    vi.spyOn(Date, 'now').mockImplementation(() => realNow + 31_000);

    const params = created?.getRequestParams();
    serveInline(await injected(2), { cid: created?.placeholders().cid });

    await expect(params).resolves.toMatchObject({ __clerk_protect_status: 'ok' });
  });

  it('does not re-run within the cooldown', async () => {
    const { session: created, injected, elements } = session([loader({ tokenTimeoutMs: 1_000 })]);
    created?.start();
    (await injected()).dispatchEvent(new Event('error'));

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'script_error' });
    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'script_error' });

    // Repeated sign-in attempts must not turn a failure into a loader-injection loop.
    expect(elements).toHaveLength(1);
  });

  it('clamps a server-configured deadline that would stall a sign-in', () => {
    // `tokenTimeoutMs` is server config with no upper bound of its own, so the ceiling is ours.
    expect(clampTimeout(120_000)).toBe(10_000);
    expect(clampTimeout(1_500)).toBe(1_500);
    expect(clampTimeout(undefined)).toBe(5_000);
    expect(clampTimeout(0)).toBe(5_000);
    expect(clampTimeout(-1)).toBe(5_000);
    expect(clampTimeout('soon')).toBe(5_000);
    expect(clampTimeout(Number.POSITIVE_INFINITY)).toBe(5_000);
  });
});

describe('ProtectSession cross-tab single flight', () => {
  /**
   * A serialising Web Locks stand-in. jsdom has no `navigator.locks`, and the `browser-tabs-lock`
   * fallback is globally mocked to always grant, so without this the double-check inside the lock
   * would never be exercised.
   */
  const installSerialisingLocks = () => {
    let tail: Promise<unknown> = Promise.resolve();
    const request = vi.fn((_key: string, _options: unknown, callback: () => Promise<unknown>) => {
      const result = tail.then(() => callback());
      tail = result.catch(() => undefined);
      return result;
    });
    Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true });
    return request;
  };

  afterEach(() => {
    delete (navigator as unknown as Record<string, unknown>).locks;
  });

  it('runs the loader once when several tabs start together', async () => {
    const request = installSerialisingLocks();

    const a = session([loader({ tokenTimeoutMs: 1_000 })]);
    const b = session([loader({ tokenTimeoutMs: 1_000 })]);
    a.session?.start();
    b.session?.start();

    serveInline(await a.injected(), { cid: a.session?.placeholders().cid });

    const results = await Promise.all([a.session?.getRequestParams(), b.session?.getRequestParams()]);

    expect(request).toHaveBeenCalledTimes(2);
    // The second tab re-read the store inside the lock and reused the leader's token, so it never
    // injected a loader of its own.
    expect(b.elements).toHaveLength(0);
    results.forEach(result => expect(result).toMatchObject({ __clerk_protect_status: 'ok' }));
  });

  it('uses whatever a leader wrote when the lock is never granted', async () => {
    Object.defineProperty(navigator, 'locks', {
      value: {
        // Mirrors SafeLock's behaviour when its own AbortSignal fires: the callback never runs.
        request: vi.fn(() => Promise.reject(new DOMException('aborted', 'AbortError'))),
      },
      configurable: true,
    });

    const { session: created } = session([loader()]);
    created?.start();
    // Written after the pre-lock read has already missed, so this can only be picked up by the
    // read that follows a failed lock acquisition.
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.leader.mac', exp: nowSeconds() + 43_200, rid: 'c'.repeat(26) }),
    );

    await expect(created?.getRequestParams()).resolves.toMatchObject({
      __clerk_protect_token: 'v1.leader.mac',
      __clerk_protect_status: 'ok',
    });
  });

  it('reports timeout when the lock is never granted and no leader succeeded', async () => {
    Object.defineProperty(navigator, 'locks', {
      value: { request: vi.fn(() => Promise.reject(new DOMException('aborted', 'AbortError'))) },
      configurable: true,
    });

    const { session: created, elements } = session([loader()]);
    created?.start();

    await expect(created?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'timeout' });
    expect(elements).toHaveLength(0);
  });
});
