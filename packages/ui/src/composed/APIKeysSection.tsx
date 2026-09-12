'use client';

import { type ComponentType, type ReactNode, Suspense } from 'react';

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
