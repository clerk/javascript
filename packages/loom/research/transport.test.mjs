import { afterEach, expect, test, vi } from 'vitest';

import { createFapiClient } from '../../clerk-js/src/core/fapiClient';
import { BaseResource } from '../../clerk-js/src/core/resources/internal';
import { SessionWithActivities } from '../../clerk-js/src/core/resources/SessionWithActivities';
import { User } from '../../clerk-js/src/core/resources/User';

const previousClerk = BaseResource.clerk;
afterEach(() => {
  BaseResource.clerk = previousClerk;
});

test('legacy failure becomes a cached empty list even after the transport recovers', async () => {
  const request = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ payload: [] });
  BaseResource.clerk = { session: { id: 'session_a' }, getFapiClient: () => ({ request }) };
  const user = new User();
  expect(await user.getSessions()).toEqual([]);
  expect(await user.getSessions()).toEqual([]);
  expect(request).toHaveBeenCalledTimes(1);
  expect(await SessionWithActivities.retrieve()).toEqual([]);
  expect(request).toHaveBeenCalledTimes(2);
});

test('the real FAPI transport reaches the endpoint each time and retains HTTP errors', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json([]))
    .mockResolvedValueOnce(
      Response.json({ errors: [{ code: 'session_not_found', message: 'missing' }] }, { status: 401 }),
    );
  vi.stubGlobal('fetch', fetch);
  const transport = createFapiClient({
    frontendApi: 'example.clerk.accounts.dev',
    instanceType: 'development',
    getSessionId: () => 'host_session',
  });
  const before = vi.fn();
  const after = vi.fn();
  transport.onBeforeRequest(before);
  transport.onAfterResponse(after);
  const empty = await transport.request({ path: '/me/sessions/active', method: 'GET', sessionId: 'caller_session' });
  const failed = await transport.request({ path: '/me/sessions/active', method: 'GET' });
  expect(empty.ok).toBe(true);
  expect(empty.payload).toEqual([]);
  expect(failed.ok).toBe(false);
  expect(failed.status).toBe(401);
  expect(failed.payload.errors[0].code).toBe('session_not_found');
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(before).toHaveBeenCalledTimes(2);
  expect(after).toHaveBeenCalledTimes(2);
  const [url, init] = fetch.mock.calls[0];
  expect(url.pathname).toBe('/v1/me/sessions/active');
  expect(url.searchParams.get('_clerk_session_id')).toBe('host_session');
  expect(init.credentials).toBe('include');
  expect(init.headers.has('authorization')).toBe(false);
  expect(init.headers.has('cookie')).toBe(false);
});

test('transport network failure rejects instead of becoming an empty list', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
  const transport = createFapiClient({
    frontendApi: 'example.clerk.accounts.dev',
    instanceType: 'development',
    getSessionId: () => 'host_session',
  });
  await expect(transport.request({ path: '/me/sessions/active' }, { fetchMaxTries: 1 })).rejects.toThrow();
});
