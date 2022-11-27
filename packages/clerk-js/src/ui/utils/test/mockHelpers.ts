import { LoadedClerk } from '@clerk/types';
import { jest } from '@jest/globals';

import { RouteContextValue } from '../../router';

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

const mockMethodsOf = (obj: any) => {
  Object.keys(obj).forEach(k => mockProp(obj, k));
};

export const mockClerkMethods = (clerk: LoadedClerk): DeepJestMocked<LoadedClerk> => {
  mockMethodsOf(clerk);
  mockMethodsOf(clerk.client.signIn);
  mockMethodsOf(clerk.client.signUp);
  mockMethodsOf(clerk.organization);
  clerk.client.sessions.forEach(session => {
    mockMethodsOf(session);
    mockMethodsOf(session.user);
    session.user?.emailAddresses.forEach(mockMethodsOf);
    session.user?.phoneNumbers.forEach(mockMethodsOf);
    session.user?.externalAccounts.forEach(mockMethodsOf);
    session.user?.organizationMemberships.forEach(m => {
      mockMethodsOf(m);
      mockMethodsOf(m.organization);
    });
  });
  mockProp(clerk, 'navigate');
  mockProp(clerk, 'setActive');
  return clerk as any as DeepJestMocked<LoadedClerk>;
};

export const mockRouteContextValue = (): DeepJestMocked<RouteContextValue> => {
  return {
    basePath: '',
    startPath: '',
    fullPath: '',
    indexPath: '',
    currentPath: '',
    queryString: '',
    queryParams: {},
    getMatchData: jest.fn(),
    matches: jest.fn(),
    baseNavigate: jest.fn(),
    navigate: jest.fn(),
    resolve: jest.fn((to: string) => new URL(to, 'https://clerk.dev')),
    refresh: jest.fn(),
    params: {},
  };
};
