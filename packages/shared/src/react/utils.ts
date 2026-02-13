import { clerkCoreErrorNoClerkSingleton } from '../internal/clerk-js/errors';
import type { LoadedClerk } from '../types';

export function assertClerkSingletonExists(clerk: LoadedClerk | undefined): asserts clerk is LoadedClerk {
  if (!clerk) {
    clerkCoreErrorNoClerkSingleton();
  }
}
