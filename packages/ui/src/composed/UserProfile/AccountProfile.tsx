import type { ReactNode } from 'react';

import { UserProfileSection } from '../../components/UserProfile/UserProfileSection';
import { useRequirePage } from '../useRequirePage';

export function AccountProfile(): ReactNode {
  if (!useRequirePage('AccountProfile')) return null;
  return <UserProfileSection />;
}
