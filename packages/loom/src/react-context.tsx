import { QueryClientProvider } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext } from 'react';

import { BootstrapClient } from './bootstrap';
import type { LoomClient } from './client';

const Context = createContext<LoomClient | null>(null);

export function LoomClientProvider({ client, children }: { client: LoomClient; children?: ReactNode }) {
  return (
    <Context.Provider
      key={client.ownerId}
      value={client}
    >
      <QueryClientProvider client={client.queryClient}>{children}</QueryClientProvider>
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
