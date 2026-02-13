import { useClerk } from '@clerk/react';
import { useEffect, useSyncExternalStore } from 'react';

import {
  getForceUpdateStatus,
  refreshForceUpdateStatus,
  subscribeForceUpdateStatus,
} from '../force-update/status-store';
import type { ForceUpdateStatus } from '../force-update/types';

type ClerkWithEnvironment = {
  __internal_environment?: {
    forceUpdate?: unknown;
    force_update?: unknown;
  } | null;
};

const getEnvironmentFromClerk = (clerk: unknown): ClerkWithEnvironment['__internal_environment'] | null => {
  return (clerk as ClerkWithEnvironment).__internal_environment || null;
};

export const useForceUpdateStatus = (): ForceUpdateStatus => {
  const clerk = useClerk();

  useEffect(() => {
    void refreshForceUpdateStatus(getEnvironmentFromClerk(clerk) as Parameters<typeof refreshForceUpdateStatus>[0]);

    return clerk.addListener(() => {
      void refreshForceUpdateStatus(getEnvironmentFromClerk(clerk) as Parameters<typeof refreshForceUpdateStatus>[0]);
    });
  }, [clerk]);

  return useSyncExternalStore(subscribeForceUpdateStatus, getForceUpdateStatus, getForceUpdateStatus);
};
