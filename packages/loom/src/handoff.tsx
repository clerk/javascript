import { ClerkContextProvider } from '@clerk/shared/react';
import type { Clerk } from '@clerk/shared/types';
import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type {} from 'react/canary';

import { createHandoffStore, type HandoffPhase } from './handoff-state';
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
  useEffect(() => store.setHost(clerk), [clerk, store]);
  const currentPhase = clerk === store.getHost() ? phase : ({ kind: 'waiting' } as const);
  return (
    <HandoffContext.Provider
      value={{ phase: currentPhase, clerk, seed, settings: initial.prefetch?.settings, fallback }}
    >
      {children}
    </HandoffContext.Provider>
  );
}

export function LoomHandoff({ children, live }: { children: ReactNode; live: ReactNode }) {
  const context = useContext(HandoffContext);
  if (!context) {
    return <>{children}</>;
  }
  const { phase, clerk, seed, settings, fallback } = context;
  if (phase.kind === 'seed' && seed) {
    return (
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
    );
  }
  if (phase.kind === 'live' && clerk && phase.clerk === clerk) {
    return (
      <ClerkContextProvider
        key={JSON.stringify([phase.generation, phase.scope])}
        clerk={clerk}
        clerkStatus={phase.clerkStatus}
      >
        {live}
      </ClerkContextProvider>
    );
  }
  return <>{fallback}</>;
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
