import React from 'react';
import { SWRConfig } from 'swr';

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  // TODO: Replace SWRConfig with the react-query equivalent.
  <SWRConfig
    value={{
      provider: () => new Map(),
    }}
  >
    {children}
  </SWRConfig>
);
