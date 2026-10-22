import { buildPublishableKey } from '@clerk/shared/keys';
import { beforeEach, expect, it, vi } from 'vitest';

import { prefetchProfile, prefetchSessions, prefetchUser } from '../nextjs';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), context: vi.fn() }));
vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@clerk/nextjs/internal/server', () => ({ getClerkClientAndRouting: mocks.context }));

const publishableKey = buildPublishableKey('clerk.example.com');

beforeEach(() => {
  mocks.auth.mockReset();
  mocks.context.mockReset();
});

it('does not open a backend client for a signed-out request', async () => {
  mocks.auth.mockResolvedValue({ userId: null, sessionId: null });
  await expect(prefetchSessions()).resolves.toBeUndefined();
  expect(mocks.context).not.toHaveBeenCalled();
});

it('uses the current request session and projects the minimal device snapshot', async () => {
  mocks.auth.mockResolvedValue({ userId: 'user_a', sessionId: 'sess_a' });
  const getActiveDevices = vi.fn().mockResolvedValue({
    object: 'active_device_sessions',
    subject: { instance_id: 'ins_a', user_id: 'user_a', session_id: 'sess_a' },
    sessions: [
      {
        id: 'sess_a',
        status: 'active',
        last_active_at: 1,
        expire_at: 2,
        abandon_at: 3,
        has_actor: false,
        latest_activity: null,
        secret: 'must-not-hydrate',
      },
    ],
  });
  mocks.context.mockResolvedValue({
    client: { sessions: { getActiveDevices } },
    routing: { publishableKey, frontendApi: 'clerk.example.com', proxyUrl: undefined, domain: '' },
  });
  const hydration = await prefetchSessions();
  expect(getActiveDevices).toHaveBeenCalledWith('sess_a', { signal: expect.any(AbortSignal) });
  expect(hydration?.scope).toEqual({
    instanceKey: JSON.stringify([publishableKey, 'clerk.example.com', '', '']),
    userId: 'user_a',
    sessionId: 'sess_a',
  });
  expect(hydration?.sessions?.data[0]?.hasActor).toBe(false);
  expect(JSON.stringify(hydration)).not.toContain('must-not-hydrate');
});

it.each([
  {
    subject: { instance_id: 'ins_a', user_id: 'user_b', session_id: 'sess_a' },
    sessions: [],
  },
  {
    subject: { instance_id: 'ins_a', user_id: 'user_a', session_id: 'sess_b' },
    sessions: [],
  },
  {
    subject: { instance_id: '', user_id: 'user_a', session_id: 'sess_a' },
    sessions: [],
  },
  {
    subject: { instance_id: 'ins_a', user_id: 'user_a', session_id: 'sess_a' },
    sessions: [{ id: 'sess_a', status: 'active', has_actor: 'yes' }],
  },
  {
    subject: { instance_id: 'ins_a', user_id: 'user_a', session_id: 'sess_a' },
    sessions: [],
  },
])('rejects a mismatched or incomplete backend response %#', async payload => {
  mocks.auth.mockResolvedValue({ userId: 'user_a', sessionId: 'sess_a' });
  mocks.context.mockResolvedValue({
    client: {
      sessions: {
        getActiveDevices: () => Promise.resolve({ object: 'active_device_sessions', ...payload }),
      },
    },
    routing: { publishableKey, frontendApi: 'clerk.example.com', proxyUrl: undefined, domain: '' },
  });
  await expect(prefetchSessions()).rejects.toThrow();
});

it('keeps a failed backend read as a failed server prefetch', async () => {
  const failure = new Error('endpoint unavailable');
  mocks.auth.mockResolvedValue({ userId: 'user_a', sessionId: 'sess_a' });
  mocks.context.mockResolvedValue({
    client: { sessions: { getActiveDevices: () => Promise.reject(failure) } },
    routing: { publishableKey, frontendApi: 'clerk.example.com', proxyUrl: undefined, domain: '' },
  });
  await expect(prefetchSessions()).rejects.toBe(failure);
});

it('propagates authentication and backend resolution errors', async () => {
  const authFailure = new Error('authentication unavailable');
  mocks.auth.mockRejectedValue(authFailure);
  await expect(prefetchSessions()).rejects.toBe(authFailure);
  expect(mocks.context).not.toHaveBeenCalled();

  const resolutionFailure = new Error('routing unavailable');
  mocks.auth.mockResolvedValue({ userId: 'user_a', sessionId: 'sess_a' });
  mocks.context.mockRejectedValue(resolutionFailure);
  await expect(prefetchSessions()).rejects.toBe(resolutionFailure);
});

it('prefetches only user through existing request routing and skips signed-out backend resolution', async () => {
  mocks.auth.mockResolvedValue({ userId: null, sessionId: null });
  expect(await prefetchUser()).toBeUndefined();
  expect(mocks.context).not.toHaveBeenCalled();
  mocks.auth.mockResolvedValue({ userId: 'user_a', sessionId: 'sess_a' });
  const user = {
    id: 'user_a',
    firstName: 'Ada',
    lastName: null,
    username: null,
    imageUrl: 'https://img.example/ada',
    hasImage: false,
    primaryEmailAddressId: null,
    emailAddresses: [],
    passwordEnabled: false,
    deleteSelfEnabled: true,
    externalAccounts: [],
    enterpriseAccounts: [],
  };
  const getUser = vi.fn(() => Promise.resolve(user));
  mocks.context.mockResolvedValue({
    client: { users: { getUser } },
    routing: { publishableKey, frontendApi: 'clerk.example.com', proxyUrl: '/proxy', domain: 'example.com' },
  });
  const hydration = await prefetchUser();
  expect(getUser).toHaveBeenCalledWith('user_a');
  expect(hydration?.user?.data).toEqual(user);
  expect(hydration?.sessions).toBeUndefined();
  expect(hydration?.scope.instanceKey).toBe(
    JSON.stringify([publishableKey, 'clerk.example.com', '/proxy', 'example.com']),
  );
});

it('keeps profile auth failure inside the safe prefetch boundary', async () => {
  mocks.auth.mockRejectedValue(new Error('secret auth failure'));
  expect(await prefetchProfile()).toBeUndefined();
  expect(mocks.context).not.toHaveBeenCalled();
});
