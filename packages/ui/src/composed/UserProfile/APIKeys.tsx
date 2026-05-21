import { lazy, Suspense } from 'react';

import { CardStateProvider } from '../../elements/contexts';

const APIKeysPage = lazy(() =>
  import('../../components/UserProfile/APIKeysPage').then(m => ({
    default: m.APIKeysPage,
  })),
);

export const APIKeys = () => (
  <CardStateProvider>
    <Suspense fallback={''}>
      <APIKeysPage />
    </Suspense>
  </CardStateProvider>
);
