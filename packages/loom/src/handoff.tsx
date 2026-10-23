import { ClerkContextProvider, useUser } from '@clerk/shared/react';
import type { Clerk } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type {} from 'react/canary';

import { createHandoffStore, type HandoffPhase, type UserReadiness } from './handoff-state';
import { parseHydration } from './hydration';
import { sameScope } from './scope';
import type { LoomHydration, PrefetchedProfile, ProfileSnapshot, SessionScope, UserSnapshot } from './types';

type ProviderProps = {
  clerk: Clerk | null | undefined;
  children?: ReactNode;
  fallback?: ReactNode;
} & ({ prefetch?: PrefetchedProfile; hydration?: never } | { hydration?: LoomHydration; prefetch?: never });

type HandoffContextValue = {
  phase: HandoffPhase;
  readiness: UserReadiness;
  generation: number;
  store: ReturnType<typeof createHandoffStore>;
  clerk: Clerk | null | undefined;
  seed: LoomHydration | null;
  settings: PrefetchedProfile['settings'] | undefined;
  fallback: ReactNode;
};

const HandoffContext = createContext<HandoffContextValue | null>(null);
const SnapshotContext = createContext<Readonly<{
  seed: LoomHydration;
  settings: PrefetchedProfile['settings'] | undefined;
}> | null>(null);

export function LoomProvider({ clerk, children, fallback = null, prefetch, hydration }: ProviderProps) {
  if (prefetch && typeof React.use !== 'function') {
    throw new Error('Loom profile prefetch requires React 19 or the Next.js App Router.');
  }
  const [initial] = useState(() => ({ prefetch, hydration }));
  const seed = useMemo(() => {
    const input = initial.prefetch?.hydration ?? initial.hydration;
    return input === undefined ? null : parseHydration(input);
  }, [initial]);
  const [store] = useState(() => createHandoffStore(clerk, seed?.scope));
  const phase = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const transition = useMemo(() => ({ clerk, ...createDeferredPromise() }), [clerk]);
  useEffect(() => {
    store.setHost(transition.clerk);
    transition.resolve();
    return () => transition.resolve();
  }, [transition, store]);
  const aligned = clerk === store.getHost();
  const currentPhase = aligned ? phase : ({ kind: 'waiting' } as const);
  const readiness: UserReadiness = aligned
    ? store.getReadiness()
    : { kind: 'pending', promise: transition.promise, resolve: transition.resolve };
  const generation = store.getGeneration() + (aligned ? 0 : 1);
  return (
    <HandoffContext.Provider
      value={{
        phase: currentPhase,
        readiness,
        generation,
        store,
        clerk,
        seed,
        settings: initial.prefetch?.settings,
        fallback,
      }}
    >
      {children}
    </HandoffContext.Provider>
  );
}

export function useLoomGeneration() {
  return useContext(HandoffContext)?.generation ?? 0;
}

export function useSuspenseUser() {
  const context = useContext(HandoffContext);
  const result = useUser();
  if (!context) {
    throw new Error('useSuspenseUser requires LoomProvider.');
  }
  if (typeof window === 'undefined') {
    return result;
  }
  const { readiness } = context;
  if (readiness.kind === 'error') {
    throw readiness.error;
  }
  if (readiness.kind === 'pending') {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Suspense consumes the provider-owned readiness promise.
    throw readiness.promise;
  }
  return result;
}

function NativeUserGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const { isLoaded, user } = useSuspenseUser();
  return <>{isLoaded && user ? children : fallback}</>;
}

export function LoomHandoff({ children, live }: { children: ReactNode; live: ReactNode }) {
  const context = useContext(HandoffContext);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!context) {
    return <>{children}</>;
  }
  const { phase, store, clerk, seed, settings, fallback } = context;
  const pending =
    phase.kind === 'seed' && seed ? (
      <SnapshotContext.Provider value={{ seed, settings }}>
        {seed.user?.data.imageUrl ? (
          <link
            rel='preload'
            as='image'
            href={seed.user.data.imageUrl}
          />
        ) : null}
        {children}
      </SnapshotContext.Provider>
    ) : (
      fallback
    );
  if (!hydrated || !clerk || clerk !== store.getHost()) {
    return <>{pending}</>;
  }
  return (
    <ClerkContextProvider
      key={JSON.stringify([store.getGeneration(), phase.kind === 'live' ? phase.scope : null])}
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <React.Suspense fallback={pending}>
        <NativeUserGate fallback={fallback}>{live}</NativeUserGate>
      </React.Suspense>
    </ClerkContextProvider>
  );
}

export function useUserSnapshot(): Readonly<{ scope: SessionScope; user: UserSnapshot }> {
  const context = useContext(SnapshotContext);
  if (!context?.seed.user) {
    throw new Error('Loom user snapshot is unavailable.');
  }
  return { scope: context.seed.scope, user: context.seed.user.data };
}

export function useProfileSnapshot(): ProfileSnapshot {
  const context = useContext(SnapshotContext);
  if (!context) {
    throw new Error('Loom user snapshot is unavailable.');
  }
  const { seed, settings } = context;
  if (!seed.user) {
    throw new Error('Loom user snapshot is unavailable.');
  }
  const user = seed.user.data;
  if (seed.profileSettings) {
    return { scope: seed.scope, user, settings: seed.profileSettings.data };
  }
  if (!settings) {
    throw new Error('Loom profile settings are unavailable.');
  }
  const result = React.use(settings);
  if (result.kind !== 'ready') {
    throw new Error('Loom profile settings are unavailable.');
  }
  const snapshot = parseHydration(result.hydration, seed.scope);
  if (!sameScope(snapshot.scope, seed.scope) || !snapshot.profileSettings) {
    throw new Error('Loom profile settings are unavailable.');
  }
  return { scope: seed.scope, user, settings: snapshot.profileSettings.data };
}
