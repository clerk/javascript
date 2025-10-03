import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren } from 'react';

const queryClient = new QueryClient();

/**
 *
 */
export function DataClientProvider({ children }: PropsWithChildren<{}>) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
