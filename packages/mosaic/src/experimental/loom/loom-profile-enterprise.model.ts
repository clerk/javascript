import { useEnterpriseConnections, useSuspenseProfile } from '@clerk/loom/react';

import { useUserProfileOptions } from '../../features/user-profile/user-profile.provider';
import { projectEnterpriseAccounts } from '../../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.model';
import type {
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from '../../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.types';

export type LoomEnterpriseState = {
  userId: string;
  accounts: UserProfileEnterpriseAccount[];
  connections: UserProfileEnterpriseConnection[];
  connectionsStatus: 'ready' | 'loading' | 'unavailable';
  connect?: (id: string) => Promise<'redirecting'>;
};

export function useLoomProfileEnterpriseModel(): LoomEnterpriseState | null {
  const { mode } = useUserProfileOptions();
  const { user, settings, actions } = useSuspenseProfile({ mode: mode === 'modal' ? 'modal' : 'navigation' });
  const choices = useEnterpriseConnections(settings.enterpriseSsoEnabled);
  if (!settings.enterpriseSsoEnabled) {
    return null;
  }
  const accounts = user.enterpriseAccounts.map(account => {
    if (account.active && (!account.id || !account.emailAddress)) {
      throw new Error('Loom linked enterprise account data is unavailable.');
    }
    return {
      id: account.id ?? '',
      emailAddress: account.emailAddress ?? '',
      enterpriseConnectionId: account.enterpriseConnectionId ?? null,
      verification: { error: { longMessage: account.verificationError ?? undefined } },
      enterpriseConnection: account.enterpriseConnection
        ? {
            active: account.enterpriseConnection.active ?? account.active,
            name: account.enterpriseConnection.name,
            logoPublicUrl: account.enterpriseConnection.logoPublicUrl ?? null,
          }
        : null,
    };
  });
  const projection = projectEnterpriseAccounts({
    enabled: true,
    accounts,
    connections: choices.data ?? [],
  });
  const connectionsStatus = choices.isError ? 'unavailable' : choices.data ? 'ready' : 'loading';
  if (projection.status === 'hidden' && connectionsStatus === 'ready') {
    return null;
  }
  return {
    userId: user.id,
    accounts: projection.status === 'ready' ? projection.accounts : [],
    connections: projection.status === 'ready' ? projection.connections : [],
    connectionsStatus,
    connect: connectionsStatus === 'ready' && actions.enterprise.available ? actions.enterprise.connect : undefined,
  };
}
