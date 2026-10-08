import type { __internal_ProtectCheckModalProps } from '@clerk/shared/types';

import { useProtectCheckConfigModel } from '../ProtectCheck/protect-check.config.model';
import { createProtectCheckRunnerModel } from '../ProtectCheck/protect-check-runner.model';
import type { ProtectCheckRunnerParams } from '../ProtectCheck/protect-check-runner.types';

export type ProtectCheckModalModel = {
  flow: 'signIn' | 'signUp';
  hasChallenge: boolean;
  onResolvedClear: () => void;
  runner: ProtectCheckRunnerParams;
  config: { loadTimeoutMs: number | undefined };
};

export function useProtectCheckModalModel({
  resource,
  onResolved,
  onFailed,
}: __internal_ProtectCheckModalProps): ProtectCheckModalModel {
  const config = useProtectCheckConfigModel();

  return {
    flow: resource.pathRoot.endsWith('sign_ups') ? 'signUp' : 'signIn',
    hasChallenge: Boolean(resource.protectCheck),
    onResolvedClear: onResolved,
    runner: {
      ...createProtectCheckRunnerModel(resource, (updated, isCancelled) => {
        if (!isCancelled() && !updated.protectCheck) {
          onResolved();
        }
        return Promise.resolve();
      }),
      onError: onFailed,
    },
    config,
  };
}
