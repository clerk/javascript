import type { LoadedClerk } from '@clerk/types';
import { jest } from '@jest/globals';

import type { RouteContextValue } from '../../router';

type FunctionLike = (...args: any) => any;

type DeepJestMocked<T> = T extends FunctionLike
  ? jest.Mocked<T>
  : T extends object
  ? {
      [k in keyof T]: DeepJestMocked<T[k]>;
    }
  : T;

const mockProp = <T>(obj: T, k: keyof T) => {
  if (typeof obj[k] === 'function') {
    // @ts-ignore
    obj[k] = jest.fn();
  }
};

const mockMethodsOf = <T extends Record<string, any> | null = any>(obj: T, options?: { exclude: (keyof T)[] }) => {
  if (!obj) {
    return;
  }
  Object.keys(obj)
    .filter(key => !options?.exclude.includes(key as keyof T))
    .forEach(k => mockProp(obj, k));
};

export const mockClerkMethods = (clerk: LoadedClerk): DeepJestMocked<LoadedClerk> => {
  mockMethodsOf(clerk);
  mockMethodsOf(clerk.client.signIn);
  mockMethodsOf(clerk.client.signUp);
  clerk.client.sessions.forEach(session => {
    mockMethodsOf(session, {
      exclude: ['experimental__checkAuthorization'],
    });
    mockMethodsOf(session.user);
    session.user?.emailAddresses.forEach(m => mockMethodsOf(m));
    session.user?.phoneNumbers.forEach(m => mockMethodsOf(m));
    session.user?.externalAccounts.forEach(m => mockMethodsOf(m));
    session.user?.organizationMemberships.forEach(m => {
      mockMethodsOf(m);
      mockMethodsOf(m.organization);
    });
  });
  mockProp(clerk, 'navigate');
  mockProp(clerk, 'setActive');
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
    getMatchData: jest.fn(),
    matches: jest.fn(),
    baseNavigate: jest.fn(),
    navigate: jest.fn(),
    resolve: jest.fn((to: string) => new URL(to, 'https://clerk.com')),
    refresh: jest.fn(),
    params: {},
  } as RouteContextValue;
};
