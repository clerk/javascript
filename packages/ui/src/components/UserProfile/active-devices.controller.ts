import { useEffect, useRef, useState } from 'react';

import { useLocalizations } from '@/ui/customizables';
import { handleError } from '@/ui/utils/errorHandler';
import { getRelativeToNowDateKey } from '@/ui/utils/getRelativeToNowDateKey';

import type { ActiveDeviceData, ActiveDeviceModel } from './active-devices.types';

export const useActiveDeviceController = (model: ActiveDeviceModel): ActiveDeviceData => {
  const { t, translateError } = useLocalizations();
  const [requestState, setRequestState] = useState<{ key: string; isLoading: boolean; error?: string }>({
    key: JSON.stringify([model.scopeKey, model.id]),
    isLoading: false,
  });
  const mounted = useRef(true);
  const key = JSON.stringify([model.scopeKey, model.id]);
  const current = useRef({ key, generation: {}, pending: undefined as Promise<void> | undefined });
  if (current.current.key !== key) {
    current.current = { key, generation: {}, pending: undefined };
  }
  const owner = current.current;
  const latest = useRef({ model, translateError });
  latest.current = { model, translateError };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  const revoke = (): Promise<void> => {
    if (!canRun() || latest.current.model.isCurrent) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const generation = owner.generation;
    const isCurrent = () => canRun() && owner.generation === generation;
    setRequestState({ key, isLoading: true });
    const request = Promise.resolve()
      .then(() => {
        if (isCurrent() && !latest.current.model.isCurrent) {
          return model.revokeSession(isCurrent);
        }
        return;
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [], error => {
            setRequestState({ key, isLoading: true, error: latest.current.translateError(error) });
          });
        }
      })
      .finally(() => {
        if (owner.pending === request) {
          owner.pending = undefined;
        }
        if (isCurrent()) {
          setRequestState(state => ({ ...state, key, isLoading: false }));
        }
      });
    owner.pending = request;
    return request;
  };

  return {
    id: model.id,
    isCurrent: model.isCurrent,
    isCurrentlyImpersonating: model.isCurrentlyImpersonating,
    isImpersonationSession: model.isImpersonationSession,
    title: model.title,
    browser: model.browser,
    location: model.location,
    ipAddress: model.ipAddress,
    isMobile: model.isMobile,
    lastActive: t(
      getRelativeToNowDateKey(model.lastActiveAt === undefined ? new Date() : new Date(model.lastActiveAt)),
    ),
    isLoading: requestState.key === key && requestState.isLoading,
    error: requestState.key === key ? requestState.error : undefined,
    revoke,
  };
};
