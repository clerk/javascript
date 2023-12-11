'use client';

import React from 'react';

import { ClerkProvider as PageClerkProvider } from '../pages/ClerkProvider';
import { type NextClerkProviderProps } from '../types';

/**
 * This is a compatibility layer to support a single ClerkProvider component in both the app and pages routers.
 * It also needs to support both Next.js before and after v13, hence the dynamic imports for certain modules.
 */
export function ClerkProvider(props: NextClerkProviderProps) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useRouter } = require('next/compat/router');
    const router = useRouter();

    return router ? <PageClerkProvider {...props} /> : <AppClerkProvider {...props} />;
  } catch (error) {
    // Silently ignore the error
    return <PageClerkProvider {...props} />;
  }
}

function AppClerkProvider(props: NextClerkProviderProps) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ClientClerkProvider } = require('../app-router/client/ClerkProvider');

  return <ClientClerkProvider {...props} />;
}
