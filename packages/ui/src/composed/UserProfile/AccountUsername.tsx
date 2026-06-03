import type { ReactNode } from 'react';

import { AccountUsername as AccountUsernameSection } from '../../components/UserProfile/AccountSections';
import { useRequirePage } from '../useRequirePage';

export function AccountUsername(): ReactNode {
  if (!useRequirePage('AccountUsername')) return null;
  return <AccountUsernameSection />;
}
