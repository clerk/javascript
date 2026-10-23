import { useProfileSnapshot } from '@clerk/loom/handoff';

import { projectEnterpriseAccounts } from '../../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.model';
import type { UserProfileEnterpriseAccount } from '../../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.types';

export type LoomEnterpriseState = { accounts: UserProfileEnterpriseAccount[] };

export function useLoomProfileEnterpriseModel(): LoomEnterpriseState | null {
  const { user, settings } = useProfileSnapshot();
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
  const projection = projectEnterpriseAccounts({ enabled: true, accounts, connections: [] });
  return projection.status === 'hidden' ? null : { accounts: projection.accounts };
}
