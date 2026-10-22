import { QueryClientProvider } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext } from 'react';

import { BootstrapClient } from './bootstrap';
import type { LoomClient } from './client';
import type { PrefetchedProfile } from './types';

const Context = createContext<LoomClient | null>(null);
const HydrationContext = createContext(false);
const PrefetchContext = createContext<PrefetchedProfile | undefined>(undefined);

export function LoomClientProvider({
  client,
  children,
  hydrationAllowed = true,
  prefetch,
}: {
  client: LoomClient;
  children?: ReactNode;
  hydrationAllowed?: boolean;
  prefetch?: PrefetchedProfile;
}) {
  return (
    <Context.Provider
      key={client.ownerId}
      value={client}
    >
      <HydrationContext.Provider value={hydrationAllowed}>
        <PrefetchContext.Provider value={prefetch}>
          <QueryClientProvider client={client.queryClient}>{children}</QueryClientProvider>
        </PrefetchContext.Provider>
      </HydrationContext.Provider>
    </Context.Provider>
  );
}

export function useLoom(): LoomClient {
  const client = useContext(Context);
  if (!client) {
    throw new Error('LoomProvider is required.');
  }
  return client;
}

export function useSessionsOptions() {
  const client = useLoom();
  return { ...client.queryOptions(), enabled: !(client instanceof BootstrapClient) };
}

export function useUserOptions() {
  const client = useLoom();
  return { ...client.userQueryOptions(), enabled: !(client instanceof BootstrapClient) };
}

export function useHydrationAllowed() {
  return useContext(HydrationContext);
}

export function useProfilePrefetch() {
  return useContext(PrefetchContext);
}
