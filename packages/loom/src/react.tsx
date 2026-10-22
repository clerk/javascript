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

export function LoomProvider(props: ProviderProps) {
  const [input, setInput] = useState({ hydration: props.hydration, prefetch: props.prefetch, revision: 0 });
  if (input.hydration !== props.hydration || input.prefetch !== props.prefetch) {
    setInput({ hydration: props.hydration, prefetch: props.prefetch, revision: input.revision + 1 });
  }
  if (props.prefetch && typeof React.use !== 'function') {
    throw new Error('Loom profile prefetch requires React 19 or the Next.js App Router.');
  }
  return (
    <ProviderLifetime
      key={input.revision}
      {...props}
    />
  );
}

function ProviderLifetime({ clerk, hydration: legacyHydration, prefetch, children, fallback = null }: ProviderProps) {
  const hydration = prefetch?.hydration ?? legacyHydration;
  const bootstrap = useMemo(
    () => (hydration === undefined ? null : new BootstrapClient(parseHydration(hydration))),
    [hydration],
  );
  const streamAllowed = useRef(true);
  const replay = useRef<{ clerk: ClerkSessionsHost; hydration: LoomHydration | undefined } | null>(null);
  const [owner, setOwner] = useState<{
    clerk: ClerkSessionsHost;
    binding: ReturnType<typeof bindClerk>;
    bootstrapAllowed: boolean;
  } | null>(null);
  useEffect(() => {
    if (!clerk) {
      return;
    }
    const initial =
      replay.current === null
        ? bootstrap?.dehydrate()
        : replay.current.clerk === clerk
          ? replay.current.hydration
          : undefined;
    const binding = bindClerk(clerk, initial);
    replay.current = { clerk, hydration: undefined };
    setOwner({ clerk, binding, bootstrapAllowed: initial !== undefined });
    return () => {
      streamAllowed.current &&= binding.getHydrationAllowed();
      replay.current = {
        clerk,
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
  if ((owner && owner.clerk !== clerk) || (binding && !binding.getHydrationAllowed())) {
    streamAllowed.current = false;
  }
  const waiting = owner === null || (owner.clerk === clerk && owner.bootstrapAllowed);
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
      hydration?.user?.data.imageUrl ? (
        <link
          rel='preload'
          as='image'
          href={hydration.user.data.imageUrl}
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
