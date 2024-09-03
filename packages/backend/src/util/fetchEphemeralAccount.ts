import type { EphemeralAccount } from '@clerk/types';

import runtime from '../runtime';

export function fetchEphemeralAccount(): Promise<EphemeralAccount> {
  return runtime.fetchEphemeralAccount();
}
