import type { ProtectLoader } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { buildCid, CID_REGEX, encodeBase32, interpolatePlaceholders, ProtectSession } from '../protectSession';

const TOKEN_URL = 'https://loader.example.com/ins_2abc/{cid}/loader.js';

const loader = (overrides: Partial<ProtectLoader> = {}): ProtectLoader => ({
  target: 'head',
  type: 'script',
  attributes: { src: TOKEN_URL },
  tokenTimeoutMs: 200,
  ...overrides,
});

const nowSeconds = () => Math.floor(Date.now() / 1_000);

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
  global.fetch = vi.fn(() => Promise.resolve(tokenResponse())) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = originalFetch;
  localStorage.clear();
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
    const session = ProtectSession.create([
      loader({ attributes: { src: 'https://loader.example.com/ins_2abc/loader.js' } }),
    ]);

    expect(session).toBeUndefined();
    // An instance not using the correlation id stores nothing in the user's browser.
    expect(localStorage.getItem('__clerk_protect_pid')).toBeNull();
  });

  it('mints a 55-char correlation id and persists only the pid', () => {
    const session = ProtectSession.create([loader()]);
    const cid = session?.placeholders().cid as string;

    expect(cid).toMatch(CID_REGEX);
    expect(cid).toHaveLength(55);
    expect(localStorage.getItem('__clerk_protect_pid')).toBe(session?.placeholders().pid);
  });

  it('reuses the persisted pid and mints a fresh rid per run', () => {
    const first = ProtectSession.create([loader()])?.placeholders();
    const second = ProtectSession.create([loader()])?.placeholders();

    expect(second?.pid).toBe(first?.pid);
    expect(second?.rid).not.toBe(first?.rid);
    expect(buildCid(second?.pid as string, second?.rid as string)).toBe(second?.cid);
  });

  it('substitutes the instance id when one is available', () => {
    const session = ProtectSession.create([loader({ tokenUrl: '{instance_id}/token' })], 'ins_2abc');
    expect(session?.placeholders().instance_id).toBe('ins_2abc');
  });

  it('falls back to an in-memory pid when localStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage is blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage is blocked');
    });

    const first = ProtectSession.create([loader()]);
    const second = ProtectSession.create([loader()]);

    expect(first?.placeholders().cid).toMatch(CID_REGEX);
    // The in-memory fallback still shares the pid across sessions on this page.
    expect(second?.placeholders().pid).toBe(first?.placeholders().pid);

    // …and acquisition still works end to end.
    first?.start();
    await expect(first?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'ok' });
  });

  it('reports unsupported when there is no CSPRNG', async () => {
    const originalGetRandomValues = crypto.getRandomValues;
    // @ts-expect-error -- deliberately removing the API to exercise the unsupported path
    crypto.getRandomValues = undefined;

    try {
      const session = ProtectSession.create([loader()]);
      session?.start();

      await expect(session?.getRequestParams()).resolves.toEqual({ __clerk_protect_status: 'unsupported' });
      expect(global.fetch).not.toHaveBeenCalled();
      // Nothing usable to interpolate, so the loader keeps its literal placeholder.
      expect(session?.placeholders().cid).toBeUndefined();
    } finally {
      crypto.getRandomValues = originalGetRandomValues;
    }
  });
});

describe('ProtectSession token acquisition', () => {
  it('derives the token endpoint from the loader URL carrying the cid', async () => {
    const session = ProtectSession.create([loader()]);
    const cid = session?.placeholders().cid;
    session?.start();
    await session?.getRequestParams();

    expect(global.fetch).toHaveBeenCalledWith(
      `https://loader.example.com/ins_2abc/${cid}/token`,
      expect.objectContaining({ credentials: 'omit' }),
    );
  });

  it('prefers an explicitly configured token endpoint', async () => {
    const session = ProtectSession.create(
      [loader({ tokenUrl: 'https://loader.example.com/{instance_id}/{cid}/token' })],
      'ins_2abc',
    );
    const cid = session?.placeholders().cid;
    session?.start();
    await session?.getRequestParams();

    expect(global.fetch).toHaveBeenCalledWith(`https://loader.example.com/ins_2abc/${cid}/token`, expect.anything());
  });

  it('reports ok and shares the token through localStorage', async () => {
    const session = ProtectSession.create([loader()]);
    session?.start();

    await expect(session?.getRequestParams()).resolves.toEqual({
      __clerk_protect_token: 'v1.payload.mac',
      __clerk_protect_status: 'ok',
      __clerk_protect_cid: session?.placeholders().cid,
    });
    expect(JSON.parse(localStorage.getItem('__clerk_protect_st') as string)).toMatchObject({
      token: 'v1.payload.mac',
      rid: session?.placeholders().rid,
    });
  });

  it('polls through a 202 until the token is minted', async () => {
    (global.fetch as Mock)
      .mockImplementationOnce(() => Promise.resolve(retryResponse()))
      .mockImplementationOnce(() => Promise.resolve(tokenResponse()));

    const session = ProtectSession.create([loader({ tokenTimeoutMs: 1_000 })]);
    session?.start();

    await expect(session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'ok' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('reports timeout when the deadline expires with no token', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.resolve(retryResponse()));

    const session = ProtectSession.create([loader({ tokenTimeoutMs: 60 })]);
    session?.start();

    await expect(session?.getRequestParams()).resolves.toEqual({
      __clerk_protect_status: 'timeout',
      __clerk_protect_cid: session?.placeholders().cid,
    });
  });

  it('reports the http status when the endpoint answers non-2xx', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.resolve(errorResponse(503)));

    const session = ProtectSession.create([loader()]);
    session?.start();

    await expect(session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'http_503' });
  });

  it('reports fetch_error when the token endpoint is unreachable', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));

    const session = ProtectSession.create([loader()]);
    session?.start();

    await expect(session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'fetch_error' });
  });

  it('reports fetch_error when a 200 carries no usable token', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.resolve({ status: 200, json: () => Promise.resolve({}) }));

    const session = ProtectSession.create([loader()]);
    session?.start();

    await expect(session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'fetch_error' });
  });

  it('reports script_error when the loader element fails to load', async () => {
    (global.fetch as Mock).mockImplementation(() => Promise.resolve(retryResponse()));

    const session = ProtectSession.create([loader({ tokenTimeoutMs: 5_000 })]);
    const element = document.createElement('script');
    session?.observeLoaderElement(element);
    session?.start();

    element.dispatchEvent(new Event('error'));

    await expect(session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'script_error' });
  });

  it('reuses a fresh token without a network call', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.cached.mac', exp: nowSeconds() + 43_200, rid: 'b'.repeat(26) }),
    );

    const session = ProtectSession.create([loader()]);
    expect(session?.hasFreshToken()).toBe(true);

    session?.start();

    await expect(session?.getRequestParams()).resolves.toEqual({
      __clerk_protect_token: 'v1.cached.mac',
      __clerk_protect_status: 'ok',
      // The cid names the run the token was minted for, which is not this tab's run.
      __clerk_protect_cid: buildCid(session?.placeholders().pid as string, 'b'.repeat(26)),
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('ignores a stored token that has expired', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.stale.mac', exp: nowSeconds() - 1, rid: 'b'.repeat(26) }),
    );

    const session = ProtectSession.create([loader()]);
    expect(session?.hasFreshToken()).toBe(false);

    session?.start();
    await expect(session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_token: 'v1.payload.mac' });
  });

  it('reports nothing at all when the instance configures no token endpoint', async () => {
    const session = ProtectSession.create([loader({ attributes: { 'data-pid': '{pid}' } })]);

    session?.start();
    await expect(session?.getRequestParams()).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
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

  it('acquires once when several tabs start together', async () => {
    const request = installSerialisingLocks();

    // The leader's run is still in flight while the other tab queues behind the lock, so the only
    // thing that can stop a second run is the re-read inside the lock.
    (global.fetch as Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve(tokenResponse()), 20)),
    );

    const sessions = [ProtectSession.create([loader()]), ProtectSession.create([loader()])];
    sessions.forEach(session => session?.start());

    const results = await Promise.all(sessions.map(session => session?.getRequestParams()));

    expect(request).toHaveBeenCalledTimes(2);
    // The second tab re-read the store inside the lock and reused the leader's token.
    expect(global.fetch).toHaveBeenCalledTimes(1);
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

    const session = ProtectSession.create([loader()]);
    session?.start();
    // Written after the pre-lock read has already missed, so this can only be picked up by the
    // read that follows a failed lock acquisition.
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.leader.mac', exp: nowSeconds() + 43_200, rid: 'c'.repeat(26) }),
    );

    await expect(session?.getRequestParams()).resolves.toMatchObject({
      __clerk_protect_token: 'v1.leader.mac',
      __clerk_protect_status: 'ok',
    });
  });

  it('reports timeout when the lock is never granted and no leader succeeded', async () => {
    Object.defineProperty(navigator, 'locks', {
      value: { request: vi.fn(() => Promise.reject(new DOMException('aborted', 'AbortError'))) },
      configurable: true,
    });

    const session = ProtectSession.create([loader()]);
    session?.start();

    await expect(session?.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'timeout' });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
