import type { VerificationStrategy } from '@clerk/shared/types';

import { useCardState } from '@/elements/contexts';

import { MFA_METHODS_TO_STEP } from './constants';

export const useSetupMfaStartScreenController = (goToStep: (step: number) => void) => {
  const card = useCardState();
  const selectMethod = (method: VerificationStrategy) => {
    goToStep(MFA_METHODS_TO_STEP[method as keyof typeof MFA_METHODS_TO_STEP]);
  };
  return { error: card.error, selectMethod };
};
