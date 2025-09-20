import type { LoadedClerk } from '@clerk/types';
import { vi } from 'vitest';

import type { RouteContextValue } from '../../router';

type FunctionLike = (...args: any) => any;

type DeepJestMocked<T> = T extends FunctionLike
  ? vi.Mocked<T>
  : T extends object
    ? {
        [k in keyof T]: DeepJestMocked<T[k]>;
      }
    : T;

type MockMap<T = any> = {
  [K in { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T]]?: vi.Mock<
    // @ts-expect-error -- the typing seems to be working in practice
    T[K]
  >;
};

const mockProp = <T>(obj: T, k: keyof T, mocks?: MockMap) => {
  if (typeof obj[k] === 'function') {
    // @ts-ignore
    obj[k] = mocks?.[k] ?? vi.fn();
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
    .forEach(k => mockProp(obj, k, options?.mocks));
};

export const mockClerkMethods = (clerk: LoadedClerk): DeepJestMocked<LoadedClerk> => {
  mockMethodsOf(clerk);
  mockMethodsOf(clerk.client.signIn);
  mockMethodsOf(clerk.client.signUp);
  mockMethodsOf(clerk.billing);
  clerk.client.sessions.forEach(session => {
    mockMethodsOf(session, {
      exclude: ['checkAuthorization'],
      mocks: {
        touch: vi.fn(() => Promise.resolve(session)),
      },
    });
    mockMethodsOf(session.user);
    session.user?.emailAddresses.forEach(m => mockMethodsOf(m));
    session.user?.phoneNumbers.forEach(m => mockMethodsOf(m));
    session.user?.externalAccounts.forEach(m => mockMethodsOf(m));
    session.user?.organizationMemberships.forEach(m => {
      mockMethodsOf(m);
      mockMethodsOf(m.organization);
    });
    session.user?.passkeys.forEach(m => mockMethodsOf(m));
  });
  mockProp(clerk, 'navigate');
  mockProp(clerk, 'setActive');
  mockProp(clerk, 'redirectWithAuth');
  mockProp(clerk, '__internal_navigateWithError');
  return clerk as any as DeepJestMocked<LoadedClerk>;
};

export const mockRouteContextValue = ({ queryString = '' }: Partial<DeepJestMocked<RouteContextValue>>) => {
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
  } as RouteContextValue;
};
