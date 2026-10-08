import type { VerificationStrategy } from '@clerk/shared/types';

export const useSetupMfaStartScreenModel = (availableMethods: VerificationStrategy[]) => {
  return { availableMethods };
};
