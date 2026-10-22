import { buildPublishableKey } from '@clerk/shared/keys';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { prefetchDevelopmentSessions } from '../server';

const publishableKey = buildPublishableKey('rested-anemone-14.clerk.accounts.dev');
const token = 'private-development-browser-token';
const origin = 'http://localhost:3000';

function session(id: string, userId: string) {
  return { id, status: 'active', user: { id: userId } };
}

function active(id: string) {
  return {
    id,
    status: 'active',
    expire_at: 1000,
    abandon_at: 2000,
    last_active_at: 500,
    actor: null,
    latest_activity: { id: 'activity', browser_name: 'Safari' },
    token: 'response-secret',
  };
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function options(userId = 'user_a', sessionId = 'sess_a') {
  return { publishableKey, identity: { userId, sessionId }, devBrowserToken: token, origin };
}

afterEach(() => vi.unstubAllGlobals());

describe('development server prefetch', () => {
  it('validates identity before active sessions and projects credentials out of the snapshot', async () => {
    const fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : input);
      expect(url.origin).toBe('https://rested-anemone-14.clerk.accounts.dev');
      expect(init).toMatchObject({ method: 'GET', cache: 'no-store', redirect: 'error' });
      expect(init?.headers).toEqual({ Origin: origin });
      expect(url.searchParams.get('__clerk_db_jwt')).toBe(token);
      if (url.pathname === '/v1/client') {
        return Promise.resolve(response({ response: { sessions: [session('sess_a', 'user_a')] } }));
      }
      expect(url.pathname).toBe('/v1/me/sessions/active');
      expect(url.searchParams.get('_clerk_session_id')).toBe('sess_a');
      return Promise.resolve(response([active('sess_a'), active('sess_other')]));
    });
    vi.stubGlobal('fetch', fetch);
    const snapshot = await prefetchDevelopmentSessions(options());
    expect(snapshot.sessions?.data.map(item => item.id)).toEqual(['sess_a', 'sess_other']);
    expect(snapshot.sessions?.data[0]).toEqual({
      id: 'sess_a',
      status: 'active',
      expireAt: 1000,
      abandonAt: 2000,
      lastActiveAt: 500,
      hasActor: false,
      latestActivity: { id: 'activity', browserName: 'Safari' },
    });
    expect(JSON.stringify(snapshot)).not.toMatch(/private-development-browser-token|response-secret/);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects mismatched client identity without reading sessions', async () => {
    const fetch = vi.fn(() => Promise.resolve(response({ response: { sessions: [session('sess_a', 'user_b')] } })));
    vi.stubGlobal('fetch', fetch);
    await expect(prefetchDevelopmentSessions(options())).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects an inactive selected client session before reading sessions', async () => {
    const fetch = vi.fn(() =>
      Promise.resolve(response({ response: { sessions: [{ ...session('sess_a', 'user_a'), status: 'expired' }] } })),
    );
    vi.stubGlobal('fetch', fetch);
    await expect(prefetchDevelopmentSessions(options())).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('isolates concurrent identities and their selected session parameters', async () => {
    const fetch = vi.fn((input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : input);
      const selected = url.searchParams.get('_clerk_session_id');
      if (url.pathname === '/v1/client') {
        return Promise.resolve(
          response({ response: { sessions: [session('sess_a', 'user_a'), session('sess_b', 'user_b')] } }),
        );
      }
      return Promise.resolve(response([active(selected === 'sess_b' ? 'sess_b' : 'sess_a')]));
    });
    vi.stubGlobal('fetch', fetch);
    const [a, b] = await Promise.all([
      prefetchDevelopmentSessions(options('user_a', 'sess_a')),
      prefetchDevelopmentSessions(options('user_b', 'sess_b')),
    ]);
    expect(a.scope).toMatchObject({ userId: 'user_a', sessionId: 'sess_a' });
    expect(b.scope).toMatchObject({ userId: 'user_b', sessionId: 'sess_b' });
    expect(a.sessions?.data.map(item => item.id)).toEqual(['sess_a']);
    expect(b.sessions?.data.map(item => item.id)).toEqual(['sess_b']);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('rejects an active list that omits the selected session', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ response: { sessions: [session('sess_a', 'user_a')] } }))
      .mockResolvedValueOnce(response([active('sess_other')]));
    vi.stubGlobal('fetch', fetch);
    await expect(prefetchDevelopmentSessions(options())).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid configuration before calling FAPI', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(prefetchDevelopmentSessions({ ...options(), devBrowserToken: '' })).rejects.toThrow();
    await expect(prefetchDevelopmentSessions({ ...options(), publishableKey: 'bad' })).rejects.toThrow();
    await expect(
      prefetchDevelopmentSessions({ ...options(), publishableKey: buildPublishableKey('clerk.example.com') }),
    ).rejects.toThrow();
    await expect(
      prefetchDevelopmentSessions({ ...options(), origin: 'https://attacker.example/path' }),
    ).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('accepts a configured staging development frontend API', async () => {
    const stagingHost = 'rested-anemone-14.clerk.accountsstage.dev';
    const fetch = vi.fn((input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : input);
      expect(url.hostname).toBe(stagingHost);
      return Promise.resolve(
        url.pathname === '/v1/client'
          ? response({ response: { sessions: [session('sess_a', 'user_a')] } })
          : response([active('sess_a')]),
      );
    });
    vi.stubGlobal('fetch', fetch);
    const snapshot = await prefetchDevelopmentSessions({
      ...options(),
      publishableKey: buildPublishableKey(stagingHost),
    });
    expect(snapshot.sessions?.data.map(item => item.id)).toEqual(['sess_a']);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps HTTP failure distinct from an empty successful list', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ errors: [{ code: 'forbidden', message: 'Forbidden' }] }, 403))
      .mockResolvedValueOnce(response({ response: { sessions: [session('sess_a', 'user_a')] } }))
      .mockResolvedValueOnce(response([]));
    vi.stubGlobal('fetch', fetch);
    await expect(prefetchDevelopmentSessions(options())).rejects.toMatchObject({ status: 403 });
    await expect(prefetchDevelopmentSessions(options())).rejects.toThrow();
  });

  it('sanitizes transport and JSON errors containing the token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(`fetch failed: ${token}`)));
    await expect(prefetchDevelopmentSessions(options())).rejects.toThrow('Loom development request failed');
    try {
      await prefetchDevelopmentSessions(options());
    } catch (error) {
      expect(JSON.stringify(error)).not.toContain(token);
      expect(String(error)).not.toContain(token);
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{', { status: 200 })));
    await expect(prefetchDevelopmentSessions(options())).rejects.toThrow('Invalid Loom development response');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(`redirect to https://example.com/${token}`)));
    await expect(prefetchDevelopmentSessions(options())).rejects.toThrow('Loom development request failed');
  });
});
