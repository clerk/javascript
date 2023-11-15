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
