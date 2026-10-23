import { parsePublishableKey } from '@clerk/shared/keys';
import type { Clerk, ClerkStatus } from '@clerk/shared/types';

import { createClerkScope } from './scope';
import type { SessionScope } from './types';

export type HandoffHost = Pick<
  Clerk,
  'loaded' | 'status' | 'publishableKey' | 'frontendApi' | 'proxyUrl' | 'domain'
> & {
  user: { id: string } | null | undefined;
  session: { id: string } | null | undefined;
  addListener: (listener: () => void, options?: { skipInitialEmit?: boolean }) => () => void;
  on: (event: 'status', listener: () => void) => void;
  off: (event: 'status', listener: () => void) => void;
};

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
  let unsubscribe: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const serverPhase = matchesInstance(initialHost, scope) ? seed : waiting;

  const read = (): HandoffPhase => {
    if (host?.loaded) {
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
    phase = read();
    for (const listener of listeners) {
      listener();
    }
  };

  const bind = () => {
    if (!host || listeners.size === 0) {
      return;
    }
    const current = host;
    const resource = current.addListener(notify, { skipInitialEmit: true });
    current.on('status', notify);
    unsubscribe = () => {
      resource();
      current.off('status', notify);
    };
  };

  phase = read();
  return {
    getSnapshot: () => phase,
    getServerSnapshot: () => serverPhase,
    getHost: () => host,
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
      host = next;
      generation += 1;
      bind();
      notify();
    },
  };
}
