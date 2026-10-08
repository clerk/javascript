import { useClerk } from '@clerk/shared/react';

import { localizationKeys, useLocalizations } from '@/ui/localization';

import { useAPIKeyRequestScopeModel } from './api-key-request-scope.model';
import type { RevokeAPIKeyModel } from './api-keys.types';

export const useRevokeAPIKeyModel = (apiKeyId?: string): RevokeAPIKeyModel => {
  const clerk = useClerk();
  const scope = useAPIKeyRequestScopeModel(apiKeyId ?? 'revoke');
  const { t } = useLocalizations();

  return {
    ...scope,
    confirmationText: t(localizationKeys('apiKeys.revokeConfirmation.confirmationText')) || 'Revoke',
    revoke: async (apiKeyID, canContinue = () => true) => {
      const isCurrent = () => scope.canRun() && canContinue();
      if (!isCurrent()) {
        return false;
      }
      try {
        await clerk.apiKeys.revoke({ apiKeyID });
        return isCurrent();
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  };
};
