import { parsePublishableKey } from '@clerk/shared/keys';
import type { Clerk, ClerkStatus } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';

import { createClerkScope } from './scope';
import type { SessionScope } from './types';

export type HandoffHost = Pick<
  Clerk,
  'loaded' | 'status' | 'publishableKey' | 'frontendApi' | 'proxyUrl' | 'domain'
> & {
  __internal_lastEmittedResources?: { user?: { id: string } | null | undefined } | null;
  user: { id: string } | null | undefined;
  session: { id: string } | null | undefined;
  addListener: (listener: () => void, options?: { skipInitialEmit?: boolean }) => () => void;
  on: (event: 'status', listener: (status: ClerkStatus) => void) => void;
  off: (event: 'status', listener: (status: ClerkStatus) => void) => void;
};

export type UserReadiness =
  | { kind: 'pending'; promise: Promise<unknown>; resolve: () => void }
  | { kind: 'ready' }
  | { kind: 'error'; error: Error };

function pendingReadiness(): UserReadiness {
  const { promise, resolve } = createDeferredPromise();
  return { kind: 'pending', promise, resolve };
}

export type HandoffPhase =
  | Readonly<{ kind: 'seed' }>
  | Readonly<{ kind: 'waiting' }>
  | Readonly<{
      kind: 'live';
      clerk: HandoffHost;
      clerkStatus: ClerkStatus;
      generation: number;
      scope: SessionScope;
    }>;

const waiting: HandoffPhase = { kind: 'waiting' };
const seed: HandoffPhase = { kind: 'seed' };

function matchesInstance(host: HandoffHost | null | undefined, scope: SessionScope | undefined): boolean {
  if (!scope) {
    return false;
  }
  if (!host) {
    return true;
  }
  const frontendApi =
    !host.loaded && host.frontendApi === ''
      ? (parsePublishableKey(host.publishableKey)?.frontendApi ?? '')
      : host.frontendApi;
  const instance = {
    publishableKey: host.publishableKey,
    frontendApi,
    proxyUrl: host.proxyUrl,
    domain: host.domain,
  };
  return (
    createClerkScope(instance, { userId: scope.userId, sessionId: scope.sessionId }).instanceKey === scope.instanceKey
  );
}

export function createHandoffStore(initialHost: HandoffHost | null | undefined, scope: SessionScope | undefined) {
  let host = initialHost;
  let retired = false;
  let generation = 0;
  let phase: HandoffPhase;
  let readiness = pendingReadiness();
  let unsubscribe: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const serverPhase = matchesInstance(initialHost, scope) ? seed : waiting;

  const read = (): HandoffPhase => {
    if (readiness.kind === 'pending') {
      if (host?.loaded && host.__internal_lastEmittedResources?.user !== undefined) {
        readiness.resolve();
        readiness = { kind: 'ready' };
      } else if (host?.status === 'error') {
        readiness.resolve();
        readiness = { kind: 'error', error: new Error('Clerk initialization failed.') };
      }
    }
    if (readiness.kind === 'error') {
      retired = true;
      return waiting;
    }
    if (host && readiness.kind === 'ready') {
      retired = true;
      return host.user && host.session
        ? {
            kind: 'live',
            clerk: host,
            clerkStatus: host.status,
            generation,
            scope: createClerkScope(host, { userId: host.user.id, sessionId: host.session.id }),
          }
        : waiting;
    }
    if (!matchesInstance(host, scope)) {
      retired = true;
    }
    return retired ? waiting : serverPhase;
  };

  const notify = () => {
    phase = { ...read() };
    for (const listener of listeners) {
      listener();
    }
  };

  const bind = () => {
    if (!host || listeners.size === 0) {
      return;
    }
    const current = host;
    const changed = () => {
      if (host === current) {
        notify();
      }
    };
    const statusChanged = (status: ClerkStatus) => {
      if (host !== current) {
        return;
      }
      if (status === 'error' && readiness.kind === 'pending') {
        readiness.resolve();
        readiness = { kind: 'error', error: new Error('Clerk initialization failed.') };
      }
      notify();
    };
    const resource = current.addListener(changed, { skipInitialEmit: true });
    current.on('status', statusChanged);
    unsubscribe = () => {
      resource();
      current.off('status', statusChanged);
    };
  };

  phase = read();
  return {
    getSnapshot: () => phase,
    getServerSnapshot: () => serverPhase,
    getHost: () => host,
    getReadiness: () => readiness,
    getGeneration: () => generation,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (listeners.size === 1) {
        bind();
        notify();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          unsubscribe?.();
          unsubscribe = undefined;
        }
      };
    },
    setHost: (next: HandoffHost | null | undefined) => {
      if (next === host) {
        return;
      }
      if (host) {
        retired = true;
      }
      unsubscribe?.();
      unsubscribe = undefined;
      if (readiness.kind === 'pending') {
        readiness.resolve();
      }
      readiness = pendingReadiness();
      host = next;
      generation += 1;
      bind();
      notify();
    },
  };
}
