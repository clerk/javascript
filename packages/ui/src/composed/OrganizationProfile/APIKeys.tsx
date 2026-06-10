'use client';

import { lazy, type ReactNode } from 'react';

import { APIKeysSection } from '../APIKeysSection';

const OrganizationAPIKeysPage = lazy(() =>
  import('../../components/OrganizationProfile/OrganizationAPIKeysPage').then(m => ({
    default: m.OrganizationAPIKeysPage,
  })),
);

export const APIKeys = (): ReactNode => <APIKeysSection page={OrganizationAPIKeysPage} />;
