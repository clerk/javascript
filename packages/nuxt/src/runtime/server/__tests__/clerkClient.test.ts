import { beforeEach, describe, expect, it, vi } from 'vitest';

// These globals are normally injected at build time by tsup.
(globalThis as any).PACKAGE_NAME = '@clerk/nuxt';
(globalThis as any).PACKAGE_VERSION = '0.0.0-test';

vi.mock('#imports', () => {
  return {
    useRuntimeConfig: vi.fn(),
  };
});

vi.mock('@clerk/backend', () => {
  return {
    createClerkClient: vi.fn().mockReturnValue({}),
  };
});

import { createClerkClient } from '@clerk/backend';

// @ts-expect-error: Nitro import. Handled by Nuxt.
import { useRuntimeConfig } from '#imports';

import { clerkClient } from '../clerkClient';

const useRuntimeConfigMock = vi.mocked(useRuntimeConfig);
const createClerkClientMock = vi.mocked(createClerkClient);

function mockRuntimeConfig(overrides: { publishableKey?: string; apiUrl?: string } = {}) {
  useRuntimeConfigMock.mockReturnValue({
    public: {
      clerk: {
        publishableKey: overrides.publishableKey ?? 'pk_test_Y2xlcmsuY2xlcmsuY29tJA',
        apiUrl: overrides.apiUrl ?? '',
        apiVersion: 'v1',
        proxyUrl: '',
        domain: '',
        isSatellite: false,
        telemetry: {},
      },
    },
    clerk: {
      secretKey: 'sk_test_xxx',
      machineSecretKey: '',
      jwtKey: '',
    },
  } as any);
}

describe('clerkClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives staging API URL from staging publishable key', () => {
    // pk_test_ + base64("safe-egret-46.clerk.accountsstage.dev$")
    const stagingPk = 'pk_test_c2FmZS1lZ3JldC00Ni5jbGVyay5hY2NvdW50c3N0YWdlLmRldiQ';
    mockRuntimeConfig({ publishableKey: stagingPk });

    clerkClient({} as any);

    expect(createClerkClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiUrl: 'https://api.clerkstage.dev',
      }),
    );
  });

  it('uses production API URL for production publishable key', () => {
    const prodPk = 'pk_test_Y2xlcmsuY2xlcmsuY29tJA';
    mockRuntimeConfig({ publishableKey: prodPk });

    clerkClient({} as any);

    expect(createClerkClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiUrl: 'https://api.clerk.com',
      }),
    );
  });

  it('prefers explicit apiUrl over derived value', () => {
    const stagingPk = 'pk_test_c2FmZS1lZ3JldC00Ni5jbGVyay5hY2NvdW50c3N0YWdlLmRldiQ';
    mockRuntimeConfig({ publishableKey: stagingPk, apiUrl: 'https://custom.api.example.com' });

    clerkClient({} as any);

    expect(createClerkClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiUrl: 'https://custom.api.example.com',
      }),
    );
  });
});
