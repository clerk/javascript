import type { ReactNode } from 'react';

import { SecurityPassword as SecurityPasswordSection } from '../../components/UserProfile/SecuritySections';
import { useRequirePage } from '../useRequirePage';

export function SecurityPassword(): ReactNode {
  if (!useRequirePage('SecurityPassword')) return null;
  return <SecurityPasswordSection />;
}
