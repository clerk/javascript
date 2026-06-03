import type { ReactNode } from 'react';

import { AccountPhone as AccountPhoneSection } from '../../components/UserProfile/AccountSections';
import { useRequirePage } from '../useRequirePage';

export function AccountPhone(): ReactNode {
  if (!useRequirePage('AccountPhone')) return null;
  return <AccountPhoneSection />;
}
