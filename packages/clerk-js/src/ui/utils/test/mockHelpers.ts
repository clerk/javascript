import { LoadedClerk } from '@clerk/types';
import { jest } from '@jest/globals';

import { RouteContextValue } from '../../router';

type DeepJestMocked<T> = T extends object
  ? {
      [k in keyof T]: T[k] extends object ? jest.Mocked<T[k]> : T[k];
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
  mockMethodsOf(clerk.client.signIn);
  mockMethodsOf(clerk.client.signUp);
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
