import type { Clerk } from '@clerk/types';

import { clerkCoreErrorContextProviderNotFound, clerkCoreErrorNoClerkSingleton } from '../../core/errors';

export function assertClerkSingletonExists(clerk: Clerk | undefined): asserts clerk is Clerk {
  if (!clerk) {
    clerkCoreErrorNoClerkSingleton();
  }
}

export function assertContextExists(contextVal: unknown, providerName: string): asserts contextVal {
  if (!contextVal) {
    clerkCoreErrorContextProviderNotFound(providerName);
  }
}

export function isRedirectForFAPIInitiatedFlow(clerk: Clerk, redirectUrl: string): boolean {
  const url = new URL(redirectUrl);
  const path = url.pathname;

  return clerk.frontendApi === url.host && frontendApiRedirectPaths.includes(path);
}

const frontendApiRedirectPaths: string[] = [
  '/oauth/authorize', // OAuth2 identify provider flow
  '/v1/verify', // magic links
  '/v1/tickets/accept', // ticket flow
];
