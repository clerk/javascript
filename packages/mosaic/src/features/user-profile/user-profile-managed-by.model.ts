import type { EnterpriseAccountResource } from '@clerk/shared/types';

import { getEnterpriseLogo } from '../../components/provider-logo/enterprise.generated';
import type { UserProfileManagedBy } from './user-profile-managed-by';

type ManagingAccount = Pick<EnterpriseAccountResource, 'provider'> & {
  enterpriseConnection?: { name?: string | null } | null;
};

export function toManagedBy(account: ManagingAccount): UserProfileManagedBy {
  const name = account.enterpriseConnection?.name || undefined;
  const logo = getEnterpriseLogo(account.provider);
  return { ...(name ? { name } : {}), ...(logo ? { logo } : {}) };
}
