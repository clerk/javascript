import { QueryClient } from '@tanstack/query-core';
import { vi } from 'vitest';

/**
 * Shared query client configuration for tests
 */
export function createMockQueryClient() {
  return {
    __tag: 'clerk-rq-client' as const,
    client: new QueryClient({
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
  };
}

/**
 * Simple mock Clerk factory with common properties
 */
export function createMockClerk(overrides: any = {}) {
  const queryClient = overrides.queryClient || createMockQueryClient();
  const listeners: Array<(resources: any) => void> = [];

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

  let currentResources: {
    client: any;
    session: any;
    user: any;
    organization: any;
  } = {
    client: mockClerk.client,
    session: mockClerk.session,
    user: mockClerk.user ?? null,
    organization: mockClerk.organization ?? null,
  };

  if (!mockClerk.addListener) {
    mockClerk.addListener = vi.fn((listener: (resources: typeof currentResources) => void) => {
      listeners.push(listener);
      listener({ ...currentResources });
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      };
    });
  }

  if (!mockClerk.__unsafe__emitResources) {
    mockClerk.__unsafe__emitResources = (resources: Partial<typeof currentResources>) => {
      currentResources = { ...currentResources, ...resources };
      if ('user' in resources) {
        mockClerk.user = resources.user;
      }
      if ('organization' in resources) {
        mockClerk.organization = resources.organization;
      }
      listeners.forEach(listener => listener({ ...currentResources }));
    };
  }

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
