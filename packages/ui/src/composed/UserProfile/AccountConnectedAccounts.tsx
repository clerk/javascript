import type { ReactNode } from 'react';

import { AccountConnectedAccounts as AccountConnectedAccountsSection } from '../../components/UserProfile/AccountSections';
import { useRequirePage } from '../useRequirePage';

export function AccountConnectedAccounts(): ReactNode {
  if (!useRequirePage('AccountConnectedAccounts')) return null;
  return <AccountConnectedAccountsSection />;
}
