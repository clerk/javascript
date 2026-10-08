import type { SignInFactor } from '@clerk/shared/types';

import { useCardState } from '../../elements/contexts';

export const useAlternativeMethodsController = (onFactorSelected: (factor: SignInFactor) => void) => {
  const card = useCardState();
  return {
    error: card.error,
    isLoading: card.isLoading,
    selectFactor: (factor: SignInFactor) => {
      card.setError(undefined);
      onFactorSelected(factor);
    },
  };
};
