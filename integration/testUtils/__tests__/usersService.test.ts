import type { ClerkClient } from '@clerk/backend';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createUserService } from '../usersService';

const fakePlaywrightTest = {
  info: () => ({ file: 'basic.test.ts', line: 24, title: 'a test', titlePath: ['a test'] }),
};

function makeMockClient(overrides: { users?: Record<string, unknown>; organizations?: Record<string, unknown> } = {}) {
  return {
    users: {
      getUserList: vi.fn().mockResolvedValue({ data: [{ id: 'user_123' }] }),
      deleteUser: vi.fn().mockResolvedValue({}),
      ...overrides.users,
    },
    organizations: {
      createOrganization: vi.fn().mockResolvedValue({ id: 'org_123' }),
      deleteOrganization: vi.fn().mockResolvedValue({}),
      ...overrides.organizations,
    },
  } as unknown as ClerkClient;
}

describe('best-effort teardown', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves when deleting the user fails', async () => {
    const client = makeMockClient({ users: { deleteUser: vi.fn().mockRejectedValue(new Error('429')) } });
    const fakeUser = createUserService(client).createFakeUser(fakePlaywrightTest);

    await expect(fakeUser.deleteIfExists()).resolves.toBeUndefined();
  });

  it('resolves when deleting the user does not finish in time', async () => {
    vi.useFakeTimers();
    const client = makeMockClient({ users: { deleteUser: vi.fn(() => new Promise(() => {})) } });
    const fakeUser = createUserService(client).createFakeUser(fakePlaywrightTest);

    const promise = fakeUser.deleteIfExists();
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves when deleting the organization fails', async () => {
    const client = makeMockClient({
      organizations: { deleteOrganization: vi.fn().mockRejectedValue(new Error('429')) },
    });
    const fakeOrganization = await createUserService(client).createFakeOrganization('user_123');

    await expect(fakeOrganization.delete()).resolves.toBeUndefined();
  });
});
