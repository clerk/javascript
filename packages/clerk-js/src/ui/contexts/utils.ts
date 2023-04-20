import type { Clerk, LoadedClerk } from '@clerk/types';

import { clerkCoreErrorContextProviderNotFound, clerkCoreErrorNoClerkSingleton } from '../../core/errors';

export function assertClerkSingletonLoaded(clerk: Clerk | undefined): asserts clerk is NonNullable<LoadedClerk> {
  if (!clerk || !clerk.client) {
    clerkCoreErrorNoClerkSingleton();
  }
}

export function assertContextExists(contextVal: unknown, providerName: string): asserts contextVal {
  if (!contextVal) {
    clerkCoreErrorContextProviderNotFound(providerName);
  }
}
