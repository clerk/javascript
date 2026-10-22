import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import * as React from 'react';
import { type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type {} from 'react/canary';

import { BootstrapClient } from './bootstrap';
import { bindClerk, type ClerkSessionsHost } from './clerk';
import { parseHydration } from './hydration';
import {
  LoomClientProvider,
  useHydrationAllowed,
  useLoom,
  useProfilePrefetch,
  useSessionsOptions,
  useUserOptions,
} from './react-context';
import { sameScope } from './scope';
import type { LoomHydration, PrefetchedProfile, ProfileSnapshot, UserNameInput } from './types';

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
} & ({ prefetch?: PrefetchedProfile; hydration?: never } | { hydration?: LoomHydration; prefetch?: never });

export function LoomProvider({
  clerk,
  hydration: legacyHydration,
  prefetch,
  children,
  fallback = null,
}: ProviderProps) {
  if (prefetch && typeof React.use !== 'function') {
    throw new Error('Loom profile prefetch requires React 19 or the Next.js App Router.');
  }
  const [input, setInput] = useState({ hydration: legacyHydration, prefetch });
  const bootstrap = useMemo(() => {
    const hydration = input.prefetch?.hydration ?? input.hydration;
    return hydration === undefined ? null : new BootstrapClient(parseHydration(hydration));
  }, [input]);
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
  if (live === undefined && waiting && (input.hydration !== legacyHydration || input.prefetch !== prefetch)) {
    setInput({ hydration: legacyHydration, prefetch });
  }
  const client = live === undefined ? (waiting ? bootstrap : null) : live;
  if (!client) {
    return <>{fallback}</>;
  }
  return (
    <LoomClientProvider
      client={client}
      hydrationAllowed={streamAllowed.current}
      prefetch={prefetch}
    >
      {prefetch &&
      streamAllowed.current &&
      sameScope(prefetch.hydration.scope, client.scope) &&
      prefetch.hydration.user?.data.imageUrl ? (
        <link
          rel='preload'
          as='image'
          href={prefetch.hydration.user.data.imageUrl}
        />
      ) : null}
      {children}
    </LoomClientProvider>
  );
}

export { QueryErrorResetBoundary } from '@tanstack/react-query';

export function useUser() {
  const owner = useLoom();
  const result = useQuery(useUserOptions());
  const updateName = useMemo(
    () => (owner.canUpdateName ? (input: UserNameInput) => owner.updateName(input) : undefined),
    [owner],
  );
  return { ...result, updateName };
}
export function useSuspenseUser() {
  const owner = useLoom();
  const result = useSuspenseQuery(useUserOptions());
  const updateName = useMemo(
    () => (owner.canUpdateName ? (input: UserNameInput) => owner.updateName(input) : undefined),
    [owner],
  );
  return { ...result, updateName };
}

export function useSuspenseProfile(): ProfileSnapshot {
  const owner = useLoom();
  const user = useSuspenseUser();
  const prefetch = useProfilePrefetch();
  const allowed = useHydrationAllowed();
  const options = owner.profileSettingsQueryOptions();
  let seed: LoomHydration['profileSettings'];
  if (
    prefetch &&
    allowed &&
    sameScope(prefetch.hydration.scope, owner.scope) &&
    !owner.queryClient.getQueryState(options.queryKey)
  ) {
    const result = React.use(prefetch.settings);
    if (result.kind === 'ready') {
      const snapshot = parseHydration(result.hydration);
      if (sameScope(snapshot.scope, owner.scope)) {
        seed = snapshot.profileSettings;
      }
    }
    if (!seed && owner instanceof BootstrapClient) {
      throw new Error('Loom profile settings are unavailable.');
    }
  }
  const settings = useSuspenseQuery({ ...options, initialData: seed?.data, initialDataUpdatedAt: seed?.updatedAt });
  return { scope: owner.scope, user: user.data, settings: settings.data };
}
