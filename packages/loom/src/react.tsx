import { QueryClientProvider, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { bindClerk, type ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';

const Context = createContext<LoomClient | null>(null);

export function LoomProvider({ client, children }: { client: LoomClient; children?: ReactNode }) {
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

export function useSessions() {
  return useQuery(useLoom().queryOptions());
}

export function useSuspenseSessions() {
  return useSuspenseQuery(useLoom().queryOptions());
}

export function ClerkLoomProvider({
  host,
  children,
  fallback = null,
}: {
  host: ClerkSessionsHost;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [owner, setOwner] = useState<{ host: ClerkSessionsHost; client: LoomClient | null } | null>(null);
  const { session } = useSession();
  const { user } = useUser();
  useEffect(() => {
    const binding = bindClerk(host);
    const update = () => setOwner({ host, client: binding.getSnapshot() });
    update();
    const unsubscribe = binding.subscribe(update);
    return () => {
      unsubscribe();
      binding.dispose();
    };
  }, [host]);
  const client = owner?.host === host ? owner.client : null;
  if (!client || client.scope.userId !== user?.id || client.scope.sessionId !== session?.id) {
    return <>{fallback}</>;
  }
  return <LoomProvider client={client}>{children}</LoomProvider>;
}

export { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useSession, useUser } from '@clerk/shared/react';
