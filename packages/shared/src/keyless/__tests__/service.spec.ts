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

const createApi = (overrides: Partial<KeylessAPI> = {}): KeylessAPI => ({
  completeOnboarding: vi.fn(() => Promise.resolve(accountlessApplication)),
  ...overrides,
});

describe('createKeylessService', () => {
  it('passes the framework as the source when completing accountless application onboarding', async () => {
    const completeOnboarding = vi.fn<KeylessAPI['completeOnboarding']>(() => Promise.resolve(accountlessApplication));

    const service = createKeylessService({
      storage: createStorage(),
      api: createApi({ completeOnboarding }),
      framework: 'nextjs',
    });

    await service.completeOnboarding();

    const [headers, source] = completeOnboarding.mock.calls[0];
    expect(headers).toBeInstanceOf(Headers);
    expect(source).toBe('nextjs');
  });

  it('sanitizes the framework before passing it as the source', async () => {
    const completeOnboarding = vi.fn<KeylessAPI['completeOnboarding']>(() => Promise.resolve(accountlessApplication));

    const service = createKeylessService({
      storage: createStorage(),
      api: createApi({ completeOnboarding }),
      framework: 'Next.js @ Canary!',
    });

    await service.completeOnboarding();

    expect(completeOnboarding.mock.calls[0][1]).toBe('next.js-canary');
  });

  it('falls back to javascript when framework sanitization produces an empty source', async () => {
    const completeOnboarding = vi.fn<KeylessAPI['completeOnboarding']>(() => Promise.resolve(accountlessApplication));

    const service = createKeylessService({
      storage: createStorage(),
      api: createApi({ completeOnboarding }),
      framework: '!!!',
    });

    await service.completeOnboarding();

    expect(completeOnboarding.mock.calls[0][1]).toBe('javascript');
  });

  it('truncates the source before passing it to the accountless application API', async () => {
    const completeOnboarding = vi.fn<KeylessAPI['completeOnboarding']>(() => Promise.resolve(accountlessApplication));

    const service = createKeylessService({
      storage: createStorage(),
      api: createApi({ completeOnboarding }),
      framework: 'a'.repeat(50),
    });

    await service.completeOnboarding();

    expect(completeOnboarding.mock.calls[0][1]).toBe('a'.repeat(36));
  });

  it('readKeys returns the stored configuration', () => {
    const storage = createStorage();
    storage.write(JSON.stringify(accountlessApplication));

    const service = createKeylessService({ storage, api: createApi() });

    expect(service.readKeys()).toEqual(accountlessApplication);
  });

  it('readKeys returns undefined when storage is empty or invalid', () => {
    const emptyService = createKeylessService({ storage: createStorage(), api: createApi() });
    expect(emptyService.readKeys()).toBeUndefined();

    const corruptStorage = createStorage();
    corruptStorage.write('not-json');
    const corruptService = createKeylessService({ storage: corruptStorage, api: createApi() });
    expect(corruptService.readKeys()).toBeUndefined();
  });

  it('removeKeys clears the stored configuration', () => {
    const storage = createStorage();
    storage.write(JSON.stringify(accountlessApplication));

    const service = createKeylessService({ storage, api: createApi() });
    service.removeKeys();

    expect(service.readKeys()).toBeUndefined();
  });
});
