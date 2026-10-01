import type { Clerk } from '../core/clerk';

const filteredSecondFactors = new WeakMap<object, unknown[]>();

export const filterSecondFactorsForLoadedUI = <T extends { strategy: string }>(
  clerk: Pick<Clerk, '__internal_uiSupports'> | undefined,
  factors: T[] | null,
): T[] | null => {
  if (
    !factors?.some(factor => factor.strategy === 'passkey') ||
    (clerk?.__internal_uiSupports?.('second_factor:passkey') ?? true)
  ) {
    return factors;
  }

  const cached = filteredSecondFactors.get(factors);
  if (cached) {
    return cached as T[];
  }
  const filtered = factors.filter(factor => factor.strategy !== 'passkey');
  filteredSecondFactors.set(factors, filtered);
  return filtered;
};
