'use client';

import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import * as React from 'react';

import { chaosLocalization } from '@/lib/chaos';

interface ChaosContextValue {
  chaos: boolean;
  setChaos: (chaos: boolean) => void;
}

const ChaosContext = React.createContext<ChaosContextValue>({ chaos: false, setChaos: () => {} });

export function ChaosProvider({ children }: { children: React.ReactNode }) {
  const [chaos, setChaos] = React.useState(false);
  const value = React.useMemo(() => ({ chaos, setChaos }), [chaos]);
  return <ChaosContext.Provider value={value}>{children}</ChaosContext.Provider>;
}

export function useChaos() {
  return React.useContext(ChaosContext);
}

export function useChaosFixture<T>(data: T, toChaos: (data: T) => T): T {
  const { chaos } = useChaos();
  return chaos ? toChaos(data) : data;
}

export function StoryMosaicProvider({ children }: { children: React.ReactNode }) {
  const { chaos } = useChaos();
  return (
    <MosaicProvider
      key={String(chaos)}
      localization={chaos ? chaosLocalization : undefined}
    >
      {children}
    </MosaicProvider>
  );
}
