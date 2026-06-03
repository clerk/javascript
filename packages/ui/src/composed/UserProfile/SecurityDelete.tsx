import type { ReactNode } from 'react';

import { SecurityDelete as SecurityDeleteSection } from '../../components/UserProfile/SecuritySections';
import { useRequirePage } from '../useRequirePage';

export function SecurityDelete(): ReactNode {
  if (!useRequirePage('SecurityDelete')) return null;
  return <SecurityDeleteSection />;
}
