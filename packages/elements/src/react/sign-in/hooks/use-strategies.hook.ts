import type { SignInStrategy } from '@clerk/types';
import { useCallback } from 'react';

import { matchStrategy } from '~/internals/machines/utils/strategies';
import type { SnapshotState } from '~/react/sign-in/contexts/sign-in.context';
import { SignInCtx } from '~/react/sign-in/contexts/sign-in.context';

/**
 * Selects the Clerk current strategy
 */
const selector = (state: SnapshotState) => state.context.currentFactor?.strategy;

export function useStrategies(_preferred?: SignInStrategy) {
  const current = SignInCtx.useSelector(selector);
  const isActive = useCallback((name: string) => (current ? matchStrategy(current, name) : false), [current]);

  return {
    current,
    isActive,
  };
}
