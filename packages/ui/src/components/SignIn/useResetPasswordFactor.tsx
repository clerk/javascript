import type { ResetPasswordCodeFactor } from '@clerk/shared/types';

import { useCoreSignIn } from '../../contexts';
import { isResetPasswordStrategy } from './utils';

export function useResetPasswordFactor() {
  const signIn = useCoreSignIn();

  return signIn.supportedFirstFactors?.find(({ strategy }) => isResetPasswordStrategy(strategy)) as
    | ResetPasswordCodeFactor
    | undefined;
}
