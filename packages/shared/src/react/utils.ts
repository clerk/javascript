import { clerkCoreErrorNoClerkSingleton } from '../internal/clerk-js/errors';
import type { Clerk } from '../types';

export function assertClerkSingletonExists(clerk: Clerk | undefined): asserts clerk is Clerk {
  if (!clerk) {
    clerkCoreErrorNoClerkSingleton();
  }
}
