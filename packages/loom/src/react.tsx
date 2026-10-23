import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { BootstrapClient } from './bootstrap';
import { bindClerk, type ClerkSessionsHost } from './clerk';
import { parseHydration } from './hydration';
import { LoomClientProvider, useSessionsOptions } from './react-context';
import type { LoomHydration } from './types';

const noClient = () => undefined;
const noSubscription = () => () => {};

export { useLoom } from './react-context';

export function useSessions() {
  return useQuery(useSessionsOptions());
}

export function useSuspenseSessions() {
  return useSuspenseQuery(useSessionsOptions());
}

type ProviderProps = {
  clerk: ClerkSessionsHost | null | undefined;
  children?: ReactNode;
  fallback?: ReactNode;
  hydration?: LoomHydration;
};

export function LoomProvider({ clerk, hydration: legacyHydration, children, fallback = null }: ProviderProps) {
  const [input, setInput] = useState(legacyHydration);
  const bootstrap = useMemo(() => (input === undefined ? null : new BootstrapClient(parseHydration(input))), [input]);
  const streamAllowed = useRef(true);
  const replay = useRef<{
    clerk: ClerkSessionsHost;
    bootstrap: BootstrapClient | null;
    hydration: LoomHydration | undefined;
  } | null>(null);
  const [owner, setOwner] = useState<{
    clerk: ClerkSessionsHost;
    binding: ReturnType<typeof bindClerk>;
    bootstrapAllowed: boolean;
  } | null>(null);
  useEffect(() => {
    if (!clerk) {
      return;
    }
    let initial: LoomHydration | undefined;
    if (replay.current === null) {
      initial = bootstrap?.dehydrate();
    } else if (replay.current.clerk === clerk) {
      initial = replay.current.bootstrap === bootstrap ? replay.current.hydration : bootstrap?.dehydrate();
    }
    const binding = bindClerk(clerk, initial);
    replay.current = { clerk, bootstrap, hydration: undefined };
    setOwner({ clerk, binding, bootstrapAllowed: initial !== undefined });
    return () => {
      if (binding.getReadySnapshot() !== undefined) {
        streamAllowed.current &&= binding.getHydrationAllowed();
      }
      replay.current = {
        clerk,
        bootstrap,
        hydration:
          binding.getSnapshot()?.dehydrate() ?? (binding.getReadySnapshot() === undefined ? initial : undefined),
      };
      binding.dispose();
    };
  }, [clerk, bootstrap]);
  const binding = owner && owner.clerk === clerk ? owner.binding : null;
  const live = useSyncExternalStore(
    binding?.subscribe ?? noSubscription,
    binding?.getReadySnapshot ?? noClient,
    noClient,
  );
  if ((owner && owner.clerk !== clerk) || (binding && live !== undefined && !binding.getHydrationAllowed())) {
    streamAllowed.current = false;
  }
  const waiting =
    owner === null ||
    (owner.clerk === clerk && (owner.bootstrapAllowed || (live === undefined && streamAllowed.current)));
  if (live === undefined && waiting && input !== legacyHydration) {
    setInput(legacyHydration);
  }
  const client = live === undefined ? (waiting ? bootstrap : null) : live;
  if (!client) {
    return <>{fallback}</>;
  }
  return <LoomClientProvider client={client}>{children}</LoomClientProvider>;
}

export { QueryErrorResetBoundary } from '@tanstack/react-query';
