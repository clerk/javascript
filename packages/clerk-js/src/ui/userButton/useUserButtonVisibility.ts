import { useDetectClickOutside } from '@clerk/shared/hooks';
import React from 'react';
import { useCoreClerk } from 'ui/contexts';

export function useUserButtonVisibility(userButtonContainer: React.RefObject<HTMLDivElement>) {
  const clerk = useCoreClerk();

  const { isActive, setIsActive } = useDetectClickOutside(userButtonContainer, false);

  /** Allow programmatic access of the UserButton visibility state */
  clerk.openUserButton = () => setIsActive(true);
  clerk.closeUserButton = () => setIsActive(false);

  return { isActive, setIsActive };
}
