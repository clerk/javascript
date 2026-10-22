import { vi } from 'vitest';

import type { ClerkSessionsHost } from '../../clerk';
import { throwResponseError } from '../../fapi';
import { createClerkScope } from '../../scope';
import type { LoomHydration } from '../../types';
import { parseUser } from '../../user';

export function clerkHost() {
  const resourceListeners = new Set<() => void>();
  const statusListeners = new Set<() => void>();
  const request = vi.fn<ReturnType<NonNullable<ClerkSessionsHost['getFapiClient']>>['request']>();
  request.mockResolvedValue(
    Object.assign(new Response(), {
      payload: [
        {
          id: 'sess_other',
          status: 'active',
          expire_at: 1000,
          abandon_at: 1000,
          last_active_at: 100,
          actor: null,
          latest_activity: { id: 'a' },
        },
      ],
    }),
  );
  const host: ClerkSessionsHost = {
    loaded: false,
    publishableKey: 'pk_test_a',
    frontendApi: 'clerk.test',
    proxyUrl: undefined,
    domain: '',
    user: null,
    session: null,
    getFapiClient: () => ({ request }),
    __internal_readUser: async ({ userId, sessionId, signal }) => {
      const response = await request({ method: 'GET', path: '/me', sessionId, signal });
      if (!response.ok) {
        throwResponseError(response);
      }
      return parseUser(response.payload, userId);
    },
    addListener: listener => {
      resourceListeners.add(listener);
      return () => {
        resourceListeners.delete(listener);
      };
    },
    on: (_event, listener) => {
      statusListeners.add(listener);
    },
    off: (_event, listener) => {
      statusListeners.delete(listener);
    },
  };
  const emitResource = () => {
    for (const listener of resourceListeners) {
      listener();
    }
  };
  const emitStatus = () => {
    for (const listener of statusListeners) {
      listener();
    }
  };
  return { host, request, resourceListeners, statusListeners, emitResource, emitStatus };
}

export const publicUser = {
  id: 'user_a',
  firstName: 'Ada',
  lastName: null,
  username: null,
  imageUrl: 'https://img.example/ada',
  hasImage: false,
  primaryEmailAddressId: null,
  emailAddresses: [],
  passwordEnabled: false,
  deleteSelfEnabled: true,
  externalAccounts: [],
  enterpriseAccounts: [],
};
export function userSeed(host: ClerkSessionsHost, updatedAt = Date.now()): LoomHydration {
  return {
    version: 5,
    scope: createClerkScope(host, { userId: 'user_a', sessionId: 'sess_current' }),
    user: { data: publicUser, updatedAt },
  };
}
