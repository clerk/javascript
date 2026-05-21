import type { QueryClient } from '@tanstack/query-core';
import { QueryClient as TanstackQueryClient } from '@tanstack/query-core';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
  clerk: undefined as any,
  user: undefined as any,
}));

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockState.clerk,
  useInitialStateContext: () => undefined,
}));

vi.mock('../base/useUserBase', () => ({
  useUserBase: () => mockState.user,
}));

// Models pre-PR #8434 @clerk/shared, which reads the hotloaded Clerk.js
// `__internal_queryClient` bridge and waits for `queryClientStatus`.
vi.mock('../../query/use-clerk-query-client', () => {
  type RecursiveMock = {
    (...args: unknown[]): RecursiveMock;
  } & {
    readonly [key in string | symbol]: RecursiveMock;
  };

  function createRecursiveProxy(label: string): RecursiveMock {
    const callableTarget = function noop(): void {};
    const handler: ProxyHandler<typeof callableTarget> = {
      get(_target, prop) {
        if (prop === 'then') {
          return undefined;
        }
        if (prop === 'toString') {
          return () => `[${label}]`;
        }
        if (prop === Symbol.toPrimitive) {
          return () => 0;
        }
        return self;
      },
      apply() {
        return self;
      },
      construct() {
        return self as unknown as object;
      },
      has() {
        return false;
      },
      set() {
        return false;
      },
    };

    const self = new Proxy(callableTarget, handler) as unknown as RecursiveMock;
    return self;
  }

  const mockQueryClient = createRecursiveProxy('LegacyClerkMockQueryClient') as unknown as QueryClient;
  const isLegacyQueryClient = (value: unknown): value is { __tag: 'clerk-rq-client'; client: QueryClient } =>
    typeof value === 'object' &&
    value !== null &&
    '__tag' in value &&
    (value as { __tag?: string }).__tag === 'clerk-rq-client';

  const useClerkQueryClient = (): [QueryClient, boolean] => {
    const clerk = mockState.clerk;
    const queryClient = clerk.__internal_queryClient;
    const [queryClientLoaded, setQueryClientLoaded] = React.useState(isLegacyQueryClient(queryClient));

    React.useEffect(() => {
      const setLoaded = () => setQueryClientLoaded(true);
      clerk.on('queryClientStatus', setLoaded);
      return () => clerk.off('queryClientStatus', setLoaded);
    }, [clerk]);

    const isLoaded = queryClientLoaded && isLegacyQueryClient(queryClient);
    return [isLoaded ? queryClient.client : mockQueryClient, isLoaded];
  };

  return { useClerkQueryClient };
});

import { useOrganizationList } from '../useOrganizationList';

function createHotloadedClerkQueryClientShim() {
  const listeners = new Set<(status: 'ready') => void>();
  let isResolving = false;
  let queryClient: { __tag: 'clerk-rq-client'; client: TanstackQueryClient } | undefined;

  return {
    loaded: true,
    telemetry: { record: vi.fn() },
    setActive: vi.fn(),
    createOrganization: vi.fn(),
    // Reached transitively via useAttemptToEnableOrganizations.
    __internal_attemptToEnableEnvironmentSetting: vi.fn(),
    get __internal_queryClient() {
      if (!queryClient && !isResolving) {
        isResolving = true;
        void Promise.resolve().then(() => {
          queryClient = {
            __tag: 'clerk-rq-client',
            client: new TanstackQueryClient({
              defaultOptions: {
                queries: {
                  retry: false,
                  staleTime: Infinity,
                  refetchOnMount: false,
                  refetchOnReconnect: false,
                  refetchOnWindowFocus: false,
                },
              },
            }),
          };
          listeners.forEach(listener => listener('ready'));
        });
      }
      return queryClient;
    },
    on: vi.fn((event: string, listener: (status: 'ready') => void) => {
      if (event === 'queryClientStatus') {
        listeners.add(listener);
      }
    }),
    off: vi.fn((event: string, listener: (status: 'ready') => void) => {
      if (event === 'queryClientStatus') {
        listeners.delete(listener);
      }
    }),
  };
}

afterEach(() => {
  vi.clearAllMocks();
  mockState.clerk = undefined;
  mockState.user = undefined;
});

describe('useOrganizationList hotload compatibility', () => {
  it('leaves the legacy mock query-client state and requests organization memberships', async () => {
    const fapiRequest = vi.fn(() =>
      Promise.resolve({
        data: [],
        total_count: 0,
      }),
    );
    const membershipRequest = vi.fn((params?: { initialPage?: number; pageSize?: number }) => {
      return fapiRequest({
        path: '/me/organization_memberships',
        method: 'GET',
        search: params,
      });
    });

    mockState.clerk = createHotloadedClerkQueryClientShim();
    mockState.user = {
      id: 'user_123',
      getOrganizationMemberships: membershipRequest,
    };

    const { result } = renderHook(() =>
      useOrganizationList({
        userMemberships: {
          pageSize: 2,
        },
      }),
    );

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.userMemberships.isLoading).toBe(true);
    expect(membershipRequest).not.toHaveBeenCalled();

    await waitFor(() => expect(membershipRequest).toHaveBeenCalledTimes(1));
    expect(membershipRequest).toHaveBeenCalledWith({ initialPage: 1, pageSize: 2 });
    expect(fapiRequest).toHaveBeenCalledWith({
      path: '/me/organization_memberships',
      method: 'GET',
      search: { initialPage: 1, pageSize: 2 },
    });
    await waitFor(() => expect(result.current.userMemberships.isLoading).toBe(false));

    expect(result.current.userMemberships.isFetching).toBe(false);
    expect(result.current.userMemberships.count).toBe(0);
  });
});
