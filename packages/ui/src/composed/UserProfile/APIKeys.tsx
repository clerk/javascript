import { lazy, type ReactNode } from 'react';

import { APIKeysSection } from '../APIKeysSection';

const APIKeysPage = lazy(() =>
  import('../../components/UserProfile/APIKeysPage').then(m => ({
    default: m.APIKeysPage,
  })),
);

export const APIKeys = (): ReactNode => <APIKeysSection page={APIKeysPage} />;
