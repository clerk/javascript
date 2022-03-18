import { ClerkState } from './client/types';
import { invalidClerkStatePropError, noClerkStateError, noFrontendApiError } from './errors';

export function warnForSsr(val: ClerkState | undefined) {
  if (!val || !val.__internal_clerk_state) {
    console.warn(noClerkStateError);
  }
}

export function assertFrontendApi(fapi: any): asserts fapi is string {
  if (!fapi || typeof fapi !== 'string') {
    throw new Error(noFrontendApiError);
  }
}

export function assertValidClerkState(val: any): asserts val is ClerkState | undefined {
  if (!val) {
    throw new Error(noClerkStateError);
  }
  if (!!val && !val.__internal_clerk_state) {
    throw new Error(invalidClerkStatePropError);
  }
}
