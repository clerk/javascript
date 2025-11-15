import { QueryClient } from '@tanstack/query-core';
import { vi } from 'vitest';

import { createClerkQueryClientCarrier } from '../../../clerk-rq/query-client-facade';

/**
 * Shared query client configuration for tests
 */
export function createMockQueryClient() {
  return createClerkQueryClientCarrier(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchOnMount: false,
        },
      },
    }),
  );
}

/**
 * Simple mock Clerk factory with common properties
 */
export function createMockClerk(overrides: any = {}) {
  const queryClient = overrides.queryClient || createMockQueryClient();

  const mockClerk: any = {
    loaded: true,
    telemetry: { record: vi.fn() },
    on: vi.fn(),
    off: vi.fn(),
    __unstable__environment: {
      commerceSettings: {
        billing: {
          user: { enabled: true },
          organization: { enabled: true },
        },
      },
    },
    ...overrides,
  };

  // Add query client as getter if not already set
  if (!Object.getOwnPropertyDescriptor(mockClerk, '__internal_queryClient')) {
    Object.defineProperty(mockClerk, '__internal_queryClient', {
      get: vi.fn(() => queryClient),
      configurable: true,
    });
  }

  return mockClerk;
}

export function createMockUser(overrides: any = {}) {
  return { id: 'user_1', ...overrides };
}

export function createMockOrganization(overrides: any = {}) {
  return { id: 'org_1', ...overrides };
}
