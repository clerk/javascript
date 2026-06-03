import type { ReactNode } from 'react';

import { AccountWeb3 as AccountWeb3Section } from '../../components/UserProfile/AccountSections';
import { useRequirePage } from '../useRequirePage';

export function AccountWeb3(): ReactNode {
  if (!useRequirePage('AccountWeb3')) return null;
  return <AccountWeb3Section />;
}
