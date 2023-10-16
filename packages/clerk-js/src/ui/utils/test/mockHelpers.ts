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

const mockMethodsOf = (obj: any) => {
  Object.keys(obj).forEach(k => mockProp(obj, k));
};

export const mockClerkMethods = (clerk: LoadedClerk): DeepJestMocked<LoadedClerk> => {
  mockMethodsOf(clerk);
  mockMethodsOf(clerk.client.signIn);
  mockMethodsOf(clerk.client.signUp);
  clerk.client.sessions.forEach(session => {
    mockMethodsOf(session);
    session.isAuthorized = jest.fn(args => {
      return new Promise(resolve => {
        // if there is no active organization user can not be authorized
        if (!session.lastActiveOrganizationId || !session.user) {
          return resolve(false);
        }

        // loop through organizationMemberships from client piggybacking
        const orgMemberships = session.user.organizationMemberships || [];
        const activeMembership = orgMemberships.find(mem => mem.organization.id === session.lastActiveOrganizationId);

        // Based on FAPI this should never happen, but we handle it anyway
        if (!activeMembership) {
          return resolve(false);
        }

        const activeOrganizationPermissions = activeMembership.permissions;
        const activeOrganizationRole = activeMembership.role;

        if (args.permission) {
          return resolve(activeOrganizationPermissions.includes(args.permission));
        }
        if (args.role) {
          return resolve(activeOrganizationRole === args.role);
        }

        if (args.any) {
          return resolve(args.any.filter(perm => activeOrganizationPermissions.includes(perm)).length > 0);
        }
      });
    });
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
