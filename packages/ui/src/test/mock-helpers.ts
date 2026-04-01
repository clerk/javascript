import type { ActiveSessionResource, LoadedClerk } from '@clerk/shared/types';
import { type Mocked, vi } from 'vitest';

import { QueryClient } from '@/core/query-core';
import type { RouteContextValue } from '@/ui/router';

type FunctionLike = (...args: any) => any;

type DeepVitestMocked<T> = T extends FunctionLike
  ? Mocked<T>
  : T extends object
    ? {
        [k in keyof T]: DeepVitestMocked<T[k]>;
      }
    : T;

// Removing vi.Mock type for now, relying on inference
type MockMap<T = any> = {
  [K in { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T]]?: ReturnType<typeof vi.fn>;
};

const mockProp = <T>(obj: T, k: keyof T, mocks?: MockMap<T>) => {
  if (typeof obj[k] === 'function') {
    const mockFn = mocks?.[k] ?? vi.fn();
    (obj[k] as unknown as ReturnType<typeof vi.fn>) = mockFn;
  }
};

const mockMethodsOf = <T extends Record<string, any> | null = any>(
  obj: T,
  options?: {
    exclude: (keyof T)[];
    mocks: MockMap<T>;
  },
) => {
  if (!obj) {
    return;
  }
  Object.keys(obj)
    .filter(key => !options?.exclude.includes(key as keyof T))
    // Pass the specific MockMap for the object T being mocked
    .forEach(k => mockProp(obj, k, options?.mocks));
};

export const mockClerkMethods = (clerk: LoadedClerk): DeepVitestMocked<LoadedClerk> => {
  // Cast clerk to any to allow mocking properties
  const clerkAny = clerk as any;

  const defaultQueryClient = {
    __tag: 'clerk-rq-client' as const,
    client: new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          // Setting staleTime to Infinity will not cause issues between tests as long as each test
          // case has its own wrapper that initializes a Clerk instance with a new QueryClient.
          staleTime: Infinity,
        },
      },
    }),
  };

  mockMethodsOf(clerkAny);
  if (clerkAny.client) {
    mockMethodsOf(clerkAny.client.signIn);
    mockMethodsOf(clerkAny.client.signUp);
    clerkAny.client.sessions?.forEach((session: ActiveSessionResource) => {
      const sessionAny = session as any;
      mockMethodsOf(sessionAny, {
        exclude: ['checkAuthorization'],
        mocks: {
          // Ensure touch mock matches expected signature if available, otherwise basic mock
          touch: vi.fn(() => Promise.resolve(session)),
        },
      });
      if (sessionAny.user) {
        mockMethodsOf(sessionAny.user);
        sessionAny.user.emailAddresses?.forEach((m: any) => mockMethodsOf(m));
        sessionAny.user.phoneNumbers?.forEach((m: any) => mockMethodsOf(m));
        sessionAny.user.externalAccounts?.forEach((m: any) => mockMethodsOf(m));
        sessionAny.user.organizationMemberships?.forEach((m: any) => {
          mockMethodsOf(m);
          if (m.organization) {
            mockMethodsOf(m.organization);
          }
        });
        sessionAny.user.passkeys?.forEach((m: any) => mockMethodsOf(m));
      }
    });
  }
  if (clerkAny.billing) {
    mockMethodsOf(clerkAny.billing);
  }

  // Mock the __internal_queryClient getter property
  Object.defineProperty(clerkAny, '__internal_queryClient', {
    get: vi.fn(() => defaultQueryClient),
    configurable: true,
  });

  mockProp(clerkAny, 'navigate');
  mockProp(clerkAny, 'setActive');
  mockProp(clerkAny, 'redirectWithAuth');
  mockProp(clerkAny, '__internal_navigateWithError');
  return clerkAny as DeepVitestMocked<LoadedClerk>;
};

export const mockRouteContextValue = ({ queryString = '' }: Partial<DeepVitestMocked<RouteContextValue>>) => {
  return {
    basePath: '',
    startPath: '',
    flowStartPath: '',
    fullPath: '',
    indexPath: '',
    currentPath: '',
    queryString,
    queryParams: {},
    getMatchData: vi.fn(),
    matches: vi.fn(),
    baseNavigate: vi.fn(),
    navigate: vi.fn(() => Promise.resolve(true)),
    resolve: vi.fn((to: string) => new URL(to, 'https://clerk.com')),
    refresh: vi.fn(),
    params: {},
  } as RouteContextValue; // Keep original type assertion, DeepVitestMocked applied to input only
};
