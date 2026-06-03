import type { ReactNode } from 'react';

import { AccountEmails as AccountEmailsSection } from '../../components/UserProfile/AccountSections';
import { useRequirePage } from '../useRequirePage';

export function AccountEmails(): ReactNode {
  if (!useRequirePage('AccountEmails')) return null;
  return <AccountEmailsSection />;
}
