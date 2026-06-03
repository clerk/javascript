import type { ReactNode } from 'react';

import { SecurityMfa as SecurityMfaSection } from '../../components/UserProfile/SecuritySections';
import { useRequirePage } from '../useRequirePage';

export function SecurityMfa(): ReactNode {
  if (!useRequirePage('SecurityMfa')) return null;
  return <SecurityMfaSection />;
}
