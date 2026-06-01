import { lazy, Suspense, type ReactNode } from 'react';

import { CardStateProvider } from '../../elements/contexts';

const APIKeysPage = lazy(() =>
  import('../../components/UserProfile/APIKeysPage').then(m => ({
    default: m.APIKeysPage,
  })),
);

export const APIKeys = (): ReactNode => (
  <CardStateProvider>
    <Suspense fallback={''}>
      <APIKeysPage />
    </Suspense>
  </CardStateProvider>
);
