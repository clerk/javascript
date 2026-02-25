import { useClerk } from '@clerk/react';
import { useEffect, useSyncExternalStore } from 'react';

import {
  getAppVersionSupportStatus,
  refreshAppVersionSupportStatus,
  subscribeAppVersionSupportStatus,
} from '../app-version-support/status-store';
import type { AppVersionSupportStatus } from '../app-version-support/types';

type ClerkWithEnvironment = {
  __internal_environment?: {
    nativeAppSettings?: unknown;
    native_app_settings?: unknown;
  } | null;
};

const getEnvironmentFromClerk = (clerk: unknown): ClerkWithEnvironment['__internal_environment'] | null => {
  return (clerk as ClerkWithEnvironment).__internal_environment || null;
};

export const useAppVersionSupportStatus = (): AppVersionSupportStatus => {
  const clerk = useClerk();

  useEffect(() => {
    void refreshAppVersionSupportStatus(
      getEnvironmentFromClerk(clerk) as Parameters<typeof refreshAppVersionSupportStatus>[0],
    );

    return clerk.addListener(() => {
      void refreshAppVersionSupportStatus(
        getEnvironmentFromClerk(clerk) as Parameters<typeof refreshAppVersionSupportStatus>[0],
      );
    });
  }, [clerk]);

  return useSyncExternalStore(subscribeAppVersionSupportStatus, getAppVersionSupportStatus, getAppVersionSupportStatus);
};
