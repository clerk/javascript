import type * as SharedReact from '@clerk/shared/react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserProfilePages } from '../switcher.pages';

let environment: {
  commerceSettings: { billing: { user: { enabled: boolean } } };
  apiKeysSettings: { user_api_keys_enabled: boolean };
};

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useClerk: () => ({}),
  };
});

vi.mock('../../../hooks/use-mosaic-environment', () => ({
  useMosaicEnvironment: () => environment,
}));

beforeEach(() => {
  environment = {
    commerceSettings: { billing: { user: { enabled: false } } },
    apiKeysSettings: { user_api_keys_enabled: false },
  };
});

describe('useUserProfilePages', () => {
  it('lists the pages every instance has', () => {
    expect(renderHook(() => useUserProfilePages()).result.current).toEqual(['account', 'security']);
  });

  it('adds billing and API keys once the instance turns them on', () => {
    environment.commerceSettings.billing.user.enabled = true;
    environment.apiKeysSettings.user_api_keys_enabled = true;
    expect(renderHook(() => useUserProfilePages()).result.current).toEqual([
      'account',
      'security',
      'billing',
      'apiKeys',
    ]);
  });
});
