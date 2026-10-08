import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';

import type {
  OrganizationSwitcherPopoverController,
  OrganizationSwitcherPopoverModel,
} from './organization-switcher-popover.types';

export const useOrganizationSwitcherPopoverController = (
  model: OrganizationSwitcherPopoverModel,
  unsafeClose?: (open: boolean) => void,
): OrganizationSwitcherPopoverController => {
  const card = useCardState();
  const mounted = useRef(true);
  const pending = useRef<Promise<boolean> | null>(null);
  const releaseSelection = useRef<() => void>();
  const cardRef = useRef(card);
  cardRef.current = card;
  const current = useRef({ scopeKey: model.scopeKey, version: 0 });
  const version = current.current.version + (current.current.scopeKey === model.scopeKey ? 0 : 1);
  current.current = { scopeKey: model.scopeKey, version };
  const canRun = () => mounted.current && current.current.version === version && model.canRun();
  const close = () => {
    if (canRun()) {
      unsafeClose?.(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    pending.current = null;
    return () => {
      mounted.current = false;
      pending.current = null;
      releaseSelection.current?.();
      releaseSelection.current = undefined;
    };
  }, [model.scopeKey]);

  const runSelection = (select: () => Promise<boolean>) => {
    if (!canRun()) {
      return Promise.resolve(false);
    }
    if (pending.current) {
      return pending.current;
    }
    const release = cardRef.current.beginRequest();
    if (!release) {
      return Promise.resolve(false);
    }
    releaseSelection.current = release;
    const action = Promise.resolve()
      .then(() => (canRun() ? select() : false))
      .then(completed => {
        if (completed !== false) {
          close();
        }
        return completed;
      })
      .finally(() => {
        if (pending.current === action) {
          pending.current = null;
          releaseSelection.current = undefined;
          release();
        }
      });
    pending.current = action;
    return action;
  };

  return {
    isReady: model.isReady,
    isStandalone: model.isStandalone,
    hidePersonal: model.hidePersonal,
    currentOrgPreview: model.currentOrgPreview,
    userRolePreview: model.userRolePreview,
    personalPreview: model.personalPreview,
    onOrganizationClick: organizationId => runSelection(() => model.selectOrganization(organizationId)),
    onPersonalWorkspaceClick: () => runSelection(model.selectPersonal),
    onCreateOrganizationClick: () => {
      if (canRun()) {
        close();
        return model.createOrganization();
      }
    },
    onManageOrganizationClick: () => {
      if (canRun()) {
        close();
        return model.manageOrganization();
      }
    },
  };
};
