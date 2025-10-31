import type { SignInFactor } from '@clerk/shared/types';

export function sortByPrimaryFactor(a: SignInFactor, b: SignInFactor) {
  if ('primary' in a && a.primary && !('primary' in b && b.primary)) {
    return -1;
  }

  if ('primary' in b && b.primary && !('primary' in a && a.primary)) {
    return 1;
  }

  return 0;
}
