import { QueryClient } from '@tanstack/query-core';
import { vi } from 'vitest';

import { __setClerkQueryClientForTest } from '@/react/query/clerk-query-client';

/**
 * Builds a deterministic QueryClient and installs it as the shared singleton.
 * Returns the legacy `{__tag, client}` shape so existing specs that read
 * `.client.setQueryData(...)` keep working without churn.
 */
export function createMockQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  });
  __setClerkQueryClientForTest(client);
  return {
    __tag: 'clerk-rq-client' as const,
    client,
  };
}

/**
 * Simple mock Clerk factory with common properties. The shared query client
 * is no longer attached to the Clerk instance — pass `queryClient: null` to
 * reset the shared singleton, or omit the option to install a fresh default.
 */
export function createMockClerk(overrides: any = {}) {
  if (overrides.queryClient === null) {
    __setClerkQueryClientForTest(undefined);
  } else if (overrides.queryClient === undefined) {
    createMockQueryClient();
  }
  // Caller-supplied queryClient (the {__tag, client} wrapper) is already
  // installed by createMockQueryClient at the test's top-level — nothing to do.

  const { queryClient: _ignored, ...rest } = overrides;

  return {
    loaded: true,
    telemetry: { record: vi.fn() },
    on: vi.fn(),
    off: vi.fn(),
    addListener: vi.fn(() => vi.fn()), // Returns unsubscribe function
    __internal_lastEmittedResources: {
      user: null,
      session: null,
      organization: null,
      client: null,
    },
    __internal_environment: {
      commerceSettings: {
        billing: {
          user: { enabled: true },
          organization: { enabled: true },
        },
      },
    },
    ...rest,
  };
}

export function createMockUser(overrides: any = {}) {
  return { id: 'user_1', ...overrides };
}

export function createMockOrganization(overrides: any = {}) {
  return { id: 'org_1', ...overrides };
}
