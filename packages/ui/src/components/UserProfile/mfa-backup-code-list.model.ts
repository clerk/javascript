import { getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';

import { useEnvironment } from '@/ui/contexts';
import type { LocalizationKey } from '@/ui/localization';

import { useProfileRequestScopeModel } from './profile-request-scope.model';

export type MfaBackupCodeListProps = {
  subtitle?: LocalizationKey;
  backupCodes?: string[];
};

export const useMfaBackupCodeListModel = () => {
  const { applicationName } = useEnvironment().displayConfig;
  const { user } = useUser();
  const scope = useProfileRequestScopeModel('profile-backup-code-list');

  return {
    hasUser: !!user,
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    applicationName,
    userIdentifier: user ? getIdentifier(user) : '',
  };
};
