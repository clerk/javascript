import type { SessionScope } from './types';

export type ClerkScopeInstance = Readonly<{
  publishableKey: string;
  frontendApi: string;
  proxyUrl?: string;
  domain: string;
}>;

export type ClerkScopeIdentity = Readonly<{ userId: string; sessionId: string }>;

export function createClerkScope(instance: ClerkScopeInstance, identity: ClerkScopeIdentity): SessionScope {
  return {
    instanceKey: JSON.stringify([
      instance.publishableKey,
      instance.frontendApi,
      instance.proxyUrl ?? '',
      instance.domain,
    ]),
    userId: identity.userId,
    sessionId: identity.sessionId,
  };
}

export function sameScope(a: SessionScope | null, b: SessionScope | null): boolean {
  return a?.instanceKey === b?.instanceKey && a?.userId === b?.userId && a?.sessionId === b?.sessionId;
}
