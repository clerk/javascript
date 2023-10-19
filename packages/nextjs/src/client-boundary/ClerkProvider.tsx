'use client';

import { useRouter } from 'next/compat/router';
import React from 'react';

import { ClientClerkProvider } from '../app-router/client/ClerkProvider';
import { ClerkProvider as PageClerkProvider } from '../pages/ClerkProvider';
import { type NextClerkProviderProps } from '../types';

/**
 * This is a compatibility layer to support a single ClerkProvider component in both the app and pages routers.
 */
export function ClerkProvider(props: NextClerkProviderProps) {
  const router = useRouter();

  const Provider = router ? PageClerkProvider : ClientClerkProvider;

  return <Provider {...props} />;
}
