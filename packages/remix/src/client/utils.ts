import { invalidClerkStatePropError, notUsingSsrWarning } from '../errors';
import { ClerkState } from './types';

export function warnForSsr(val: ClerkState | undefined) {
  if (!val || !val.__internal_clerk_state) {
    console.warn(notUsingSsrWarning);
  }
}

export function assertValidClerkState(val: any): asserts val is ClerkState | undefined {
  if (!!val && !val.__internal_clerk_state) {
    throw new Error(invalidClerkStatePropError);
  }
}
