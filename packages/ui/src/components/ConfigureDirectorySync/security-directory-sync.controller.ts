import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import type { useSecurityDirectorySyncModel } from './security-directory-sync.model';

export const useConfiguredDirectorySyncController = (
  model: Pick<
    ReturnType<typeof useSecurityDirectorySyncModel>,
    'requestKey' | 'canRun' | 'status' | 'updateEnabled' | 'onDelete'
  >,
  organizationName: string,
  contentRef: React.RefObject<HTMLDivElement>,
  onConfigure: () => void,
) => {
  const card = useCardState();
  const mounted = useRef(true);
  const pendingRequest = useRef<(() => void) | null>(null);
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const isCurrent = () => mounted.current && scope.current.version === version && model.canRun();
  const [removeDialog, setRemoveDialog] = useState({ version, isOpen: false });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const release = pendingRequest.current;
      pendingRequest.current = null;
      release?.();
    };
  }, [model.requestKey]);

  const handleUpdateEnabled = async (enabled: boolean) => {
    if (!isCurrent() || pendingRequest.current) {
      return;
    }
    const release = card.beginRequest();
    if (!release) {
      return;
    }

    pendingRequest.current = release;
    card.setError(undefined);

    try {
      await model.updateEnabled(enabled);
    } catch (error) {
      if (isCurrent() && pendingRequest.current === release) {
        handleError(error as Error, [], card.setError);
      }
    } finally {
      if (pendingRequest.current === release) {
        pendingRequest.current = null;
        release();
      }
    }
  };

  return {
    requestKey: model.requestKey,
    canRun: isCurrent,
    isActive: model.status === 'active',
    isLoading: card.isLoading,
    error: card.error,
    isRemoveDialogOpen: removeDialog.version === version && removeDialog.isOpen,
    openRemoveDialog: () => {
      if (isCurrent()) {
        setRemoveDialog({ version, isOpen: true });
      }
    },
    closeRemoveDialog: () => {
      if (isCurrent()) {
        setRemoveDialog({ version, isOpen: false });
      }
    },
    updateEnabled: handleUpdateEnabled,
    onDelete: () => (isCurrent() ? model.onDelete() : Promise.resolve()),
    organizationName,
    contentRef,
    onConfigure: () => {
      if (isCurrent()) {
        onConfigure();
      }
    },
  };
};
