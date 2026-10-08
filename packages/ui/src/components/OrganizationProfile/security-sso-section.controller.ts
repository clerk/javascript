import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import { localizationKeys } from '../../customizables';
import type { toSecuritySsoConnectionRow } from './security-sso-section.model';

export const useSecuritySsoConnectionRowController = (model: ReturnType<typeof toSecuritySsoConnectionRow>) => {
  const card = useCardState();
  const { connection, enterpriseConnectionMutations, onConfigure, onOpenConnection, status } = model;
  const { setConnectionActive, deleteConnection } = enterpriseConnectionMutations;
  const mounted = useRef(true);
  const pendingRequest = useRef<(() => void) | null>(null);
  const identity = JSON.stringify([model.ownerKey, connection.id]);
  const scope = useRef({ identity, version: 0 });
  if (scope.current.identity !== identity) {
    scope.current = { identity, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const isCurrent = () => mounted.current && scope.current.version === version && model.canRun();
  const [removeDialog, setRemoveDialog] = useState({ version, isOpen: false });
  const isRemoveDialogOpen = removeDialog.version === version && removeDialog.isOpen;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const release = pendingRequest.current;
      pendingRequest.current = null;
      release?.();
    };
  }, [identity]);

  const onSetActive = async (active: boolean) => {
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
      await setConnectionActive(connection.id, active);
    } catch (err) {
      if (isCurrent() && pendingRequest.current === release) {
        handleError(err as Error, [], card.setError);
      }
    } finally {
      if (pendingRequest.current === release) {
        pendingRequest.current = null;
        release();
      }
    }
  };

  const actions =
    onConfigure && onOpenConnection
      ? [
          {
            label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__edit'),
            onClick: () => {
              if (isCurrent()) {
                onOpenConnection(connection.id);
              }
            },
          },
          ...(status === 'in_progress'
            ? [
                {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__continue'),
                  onClick: () => {
                    if (isCurrent()) {
                      onConfigure({ kind: 'existing', id: connection.id });
                    }
                  },
                },
              ]
            : []),
          ...(status === 'active'
            ? [
                {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__deactivate'),
                  isDisabled: card.isLoading,
                  onClick: () => onSetActive(false),
                },
              ]
            : []),
          ...(status === 'inactive'
            ? [
                {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__activate'),
                  isDisabled: card.isLoading,
                  onClick: () => onSetActive(true),
                },
              ]
            : []),
          {
            label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__remove'),
            isDestructive: true,
            onClick: () => {
              if (isCurrent()) {
                setRemoveDialog({ version, isOpen: true });
              }
            },
          },
        ]
      : undefined;

  return {
    requestKey: JSON.stringify([identity, version]),
    canRun: isCurrent,
    preview: model.preview,
    badge: model.badge,
    label: model.label,
    organizationName: model.organizationName,
    contentRef: model.contentRef,
    actions,
    error: card.error,
    isRemoveDialogOpen,
    onCloseRemoveDialog: () => {
      if (isCurrent()) {
        setRemoveDialog({ version, isOpen: false });
      }
    },
    onDelete: async () => {
      if (!isCurrent()) {
        return;
      }
      try {
        await deleteConnection(connection.id);
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
      }
    },
  };
};
