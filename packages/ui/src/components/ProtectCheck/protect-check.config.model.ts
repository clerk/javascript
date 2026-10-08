import { useClerk } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';

export function useProtectCheckConfigModel() {
  const clerk = useClerk();
  const environment = useEnvironment();

  return {
    loadTimeoutMs:
      clerk.__internal_protectChallengeLoadTimeoutMs ?? environment.protectConfig?.challenge_load_timeout_ms,
  };
}
