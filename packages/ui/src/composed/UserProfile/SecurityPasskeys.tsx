import type { ReactNode } from 'react';

import { SecurityPasskeys as SecurityPasskeysSection } from '../../components/UserProfile/SecuritySections';
import { useRequirePage } from '../useRequirePage';

export function SecurityPasskeys(): ReactNode {
  if (!useRequirePage('SecurityPasskeys')) return null;
  return <SecurityPasskeysSection />;
}
