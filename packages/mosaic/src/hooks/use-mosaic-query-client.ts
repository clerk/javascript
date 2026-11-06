import { getClerkQueryClient } from '@clerk/shared/react';
import { QueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function useMosaicQueryClient() {
  const [client] = useState(() => {
    const sharedClient = getClerkQueryClient();
    if (sharedClient) {
      return sharedClient;
    }
    if (typeof window !== 'undefined') {
      throw new Error('The Clerk query client is not available.');
    }
    return new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  });

  return client;
}
