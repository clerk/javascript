import type { EnterpriseAccountResource } from '@clerk/shared/types';

import type { UserProfileManagedBy } from './user-profile-managed-by';
import { toProviderLogoId } from './user-profile-provider-icon.model';

type ManagingAccount = Pick<EnterpriseAccountResource, 'provider'> & {
  enterpriseConnection?: { name?: string | null } | null;
};

export function toManagedBy(account: ManagingAccount): UserProfileManagedBy {
  const name = account.enterpriseConnection?.name || undefined;
  const provider = toProviderLogoId(account.provider);
  return { ...(name ? { name } : {}), ...(provider ? { provider } : {}) };
}
