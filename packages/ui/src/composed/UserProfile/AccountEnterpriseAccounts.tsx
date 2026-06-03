import type { ReactNode } from 'react';

import { AccountEnterpriseAccounts as AccountEnterpriseAccountsSection } from '../../components/UserProfile/AccountSections';
import { useRequirePage } from '../useRequirePage';

export function AccountEnterpriseAccounts(): ReactNode {
  if (!useRequirePage('AccountEnterpriseAccounts')) return null;
  return <AccountEnterpriseAccountsSection />;
}
