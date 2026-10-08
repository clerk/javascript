import { useCoreSignUp } from '../../contexts';
import { useNavigateToFlowStart } from '../../hooks/useNavigateToFlowStart';
import { useProtectCheckConfigModel } from '../ProtectCheck/protect-check.config.model';
import { createProtectCheckRunnerModel } from '../ProtectCheck/protect-check-runner.model';
import type { ProtectCheckFlowModel, SignUpProtectCheckPaths } from '../ProtectCheck/protect-check-runner.types';
import { useCompleteSignUpFlow } from './useCompleteSignUpFlow';

export const useSignUpProtectCheckModel = (paths: SignUpProtectCheckPaths): ProtectCheckFlowModel => {
  const signUp = useCoreSignUp();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const completeSignUpFlow = useCompleteSignUpFlow();
  const protectCheckConfig = useProtectCheckConfigModel();

  return {
    hasProtectCheck: Boolean(signUp.protectCheck),
    navigateToFlowStart,
    protectCheckConfig,
    runner: createProtectCheckRunnerModel(signUp, async (resolved, isCancelled) => {
      if (!isCancelled()) {
        await completeSignUpFlow({ signUp: resolved, ...paths });
      }
    }),
  };
};
