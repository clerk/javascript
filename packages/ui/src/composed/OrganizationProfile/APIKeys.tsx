import { lazy, Suspense, type ReactNode } from 'react';

import { CardStateProvider } from '../../elements/contexts';

const OrganizationAPIKeysPage = lazy(() =>
  import('../../components/OrganizationProfile/OrganizationAPIKeysPage').then(m => ({
    default: m.OrganizationAPIKeysPage,
  })),
);

export const APIKeys = (): ReactNode => (
  <CardStateProvider>
    <Suspense fallback={''}>
      <OrganizationAPIKeysPage />
    </Suspense>
  </CardStateProvider>
);
