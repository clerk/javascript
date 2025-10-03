import React, { type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

/**
 *
 */
export function DataClientProvider({ children }: PropsWithChildren<{}>) {
  return <SWRConfig value={{}}>{children}</SWRConfig>;
}
