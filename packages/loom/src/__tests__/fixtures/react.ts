import { type ClerkScopeInstance, createClerkScope } from '../../scope';
import type { LoomHydration } from '../../types';

export function clerkHost() {
  return {
    host: {
      publishableKey: 'pk_test_a',
      frontendApi: 'clerk.test',
      proxyUrl: undefined,
      domain: '',
    },
  };
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
export function userSeed(host: ClerkScopeInstance, updatedAt = Date.now()): LoomHydration {
  return {
    version: 5,
    scope: createClerkScope(host, { userId: 'user_a', sessionId: 'sess_current' }),
    user: { data: publicUser, updatedAt },
  };
}
