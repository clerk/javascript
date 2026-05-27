import { describe, expect, it, vi } from 'vitest';

import { createKeylessService, type KeylessAPI, type KeylessStorage } from '../service';
import type { AccountlessApplication } from '../types';

const accountlessApplication: AccountlessApplication = {
  publishableKey: 'pk_test_keyless',
  secretKey: 'sk_test_keyless',
  claimUrl: 'https://dashboard.clerk.com/claim',
  apiKeysUrl: 'https://dashboard.clerk.com/api-keys',
};

const createStorage = (): KeylessStorage => {
  let value = '';

  return {
    read: vi.fn(() => value),
    write: vi.fn(data => {
      value = data;
    }),
    remove: vi.fn(() => {
      value = '';
    }),
  };
};

describe('createKeylessService', () => {
  it('passes the framework as the source when creating an accountless application', async () => {
    const createAccountlessApplication = vi.fn<KeylessAPI['createAccountlessApplication']>(() =>
      Promise.resolve(accountlessApplication),
    );

    const service = createKeylessService({
      storage: createStorage(),
      api: {
        createAccountlessApplication,
        completeOnboarding: vi.fn(() => Promise.resolve(accountlessApplication)),
      },
      framework: 'nextjs',
    });

    await service.getOrCreateKeys();

    const [headers, source] = createAccountlessApplication.mock.calls[0];
    expect(headers).toBeInstanceOf(Headers);
    expect(source).toBe('nextjs');
  });

  it('passes the framework as the source when completing accountless application onboarding', async () => {
    const completeOnboarding = vi.fn<KeylessAPI['completeOnboarding']>(() => Promise.resolve(accountlessApplication));

    const service = createKeylessService({
      storage: createStorage(),
      api: {
        createAccountlessApplication: vi.fn(() => Promise.resolve(accountlessApplication)),
        completeOnboarding,
      },
      framework: 'nextjs',
    });

    await service.completeOnboarding();

    const [headers, source] = completeOnboarding.mock.calls[0];
    expect(headers).toBeInstanceOf(Headers);
    expect(source).toBe('nextjs');
  });
});
