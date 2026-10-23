import { buildPublishableKey } from '@clerk/shared/keys';
import { beforeEach, expect, it, vi } from 'vitest';

import { prefetchProfile, prefetchUser } from '../nextjs';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), context: vi.fn() }));
vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@clerk/nextjs/internal/server', () => ({ getClerkClientAndRouting: mocks.context }));

const publishableKey = buildPublishableKey('clerk.example.com');

beforeEach(() => {
  mocks.auth.mockReset();
  mocks.context.mockReset();
});

it('rejects profile auth failures with a safe message instead of looking signed out', async () => {
  mocks.auth.mockRejectedValue(new Error('secret auth failure'));
  await expect(prefetchProfile()).rejects.toThrow('Loom profile authentication failed.');
  expect(mocks.context).not.toHaveBeenCalled();
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
  expect(hydration).not.toHaveProperty('sessions');
  expect(hydration?.scope.instanceKey).toBe(
    JSON.stringify([publishableKey, 'clerk.example.com', '/proxy', 'example.com']),
  );
});
