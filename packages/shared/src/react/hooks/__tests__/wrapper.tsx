import React from 'react';
import { SWRConfig } from 'swr';

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      provider: () => new Map(),
    }}
  >
    {children}
  </SWRConfig>
);
