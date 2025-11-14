'use client';

import { useEffect, useRef } from 'react';

import { useClerkInstanceContext } from '../contexts';

type UseClearCacheOnSignOutParams = {
  onSignOut: () => void;
};

export function useClearCacheOnSignOut({ onSignOut }: UseClearCacheOnSignOutParams): void {
  const clerk = useClerkInstanceContext();
  const previousUserRef = useRef(clerk.user);

  useEffect(() => {
    if (!clerk?.addListener) {
      return;
    }

    return clerk.addListener(resources => {
      const previousUser = previousUserRef.current;
      previousUserRef.current = resources.user;

      if (previousUser && resources.user === null) {
        onSignOut();
      }
    });
  }, [clerk, onSignOut]);
}
