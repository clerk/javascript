'use client';

import { Suspense, type ComponentType, type ReactNode } from 'react';

import { CardStateProvider } from '../elements/contexts';

export function APIKeysSection({ page: Page }: { page: ComponentType }): ReactNode {
  return (
    <CardStateProvider>
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </CardStateProvider>
  );
}
