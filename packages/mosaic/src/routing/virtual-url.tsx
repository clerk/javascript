'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

const VirtualUrlValueContext = createContext<string | undefined>(undefined);
const VirtualUrlWriteContext = createContext<((url: string) => void) | undefined>(undefined);

export interface VirtualUrlProviderProps {
  initialUrl?: string;
  children: ReactNode;
}

export function VirtualUrlProvider({ initialUrl = '/', children }: VirtualUrlProviderProps) {
  const [url, setUrl] = useState(initialUrl);
  return (
    <VirtualUrlWriteContext.Provider value={setUrl}>
      <VirtualUrlValueContext.Provider value={url}>{children}</VirtualUrlValueContext.Provider>
    </VirtualUrlWriteContext.Provider>
  );
}

function missingProvider(): never {
  throw new Error('[clerk] Virtual routing must be used within a <MosaicProvider>.');
}

export function useVirtualUrl(): string {
  return useContext(VirtualUrlValueContext) ?? missingProvider();
}

export function useVirtualUrlWrite(): (url: string) => void {
  return useContext(VirtualUrlWriteContext) ?? missingProvider();
}
