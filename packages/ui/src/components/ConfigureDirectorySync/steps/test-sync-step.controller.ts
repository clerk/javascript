import { useEffect, useRef, useState } from 'react';

import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import type { useTestSyncStepModel } from './test-sync-step.model';

export const useTestSyncStepController = ({
  isPull,
  lastSyncedAt,
  lastSyncStatus,
  changedUserCount,
  revalidateUsers,
  revalidateStatus,
  requestKey,
  canRun,
}: ReturnType<typeof useTestSyncStepModel>) => {
  const { goPrev } = useWizard();
  const mounted = useRef(false);
  const scope = useRef({ key: requestKey, version: 0 });
  if (scope.current.key !== requestKey) {
    scope.current = { key: requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const isCurrent = () => mounted.current && scope.current.version === version && canRun();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, [requestKey]);
  // The two queries poll independently, so a finished run is reported while the
  // list on screen still predates it. Refresh the list for every run, whoever
  // started it, and keep waiting until that lands: otherwise the stale empty
  // list reads as the run's result.
  const [refresh, setRefresh] = useState({ version, isPending: false });
  const isRefreshingAfterSync = refresh.version === version && refresh.isPending;
  const lastSyncedAtTime = lastSyncedAt?.getTime();
  useEffect(() => {
    if (!isPull || lastSyncedAtTime === undefined || !canRun()) {
      setRefresh({ version, isPending: false });
      return;
    }
    let active = true;
    setRefresh({ version, isPending: true });
    const refreshUsers = async () => {
      try {
        await revalidateUsers();
      } finally {
        if (active && mounted.current && scope.current.version === version) {
          setRefresh({ version, isPending: false });
        }
      }
    };
    void refreshUsers().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isPull, lastSyncedAtTime, revalidateUsers, canRun, version]);

  // The run reports how many users it changed, and those users are provisioned
  // after it finishes. A count above zero with nothing listed yet means they
  // are still landing; zero is the settled answer that the run changed nobody.
  // The count is absent on a backend that predates it, and then the refresh
  // above is all there is to go on.
  const hasUsersStillLanding = changedUserCount !== null && changedUserCount > 0;

  // A push directory is always waiting: the IdP provisions whenever it likes.
  // A pull directory that has finished a run is not — an empty list is that
  // run's result, and spinning implies work that will never happen.
  const isWaitingForUsers =
    !isPull || lastSyncStatus === null || lastSyncStatus === 'running' || hasUsersStillLanding || isRefreshingAfterSync;

  return {
    goPrev: () => {
      if (isCurrent()) {
        goPrev();
      }
    },
    isWaitingForUsers,
    onSynced: async () => {
      if (isCurrent()) {
        await revalidateStatus().catch(() => undefined);
      }
    },
  };
};
