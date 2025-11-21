import React from 'react';

import { SWRConfigCompat } from '../../providers/SWRConfigCompat';

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfigCompat
    swrConfig={{
      provider: () => new Map(),
    }}
  >
    {children}
  </SWRConfigCompat>
);
