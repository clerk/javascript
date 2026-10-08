import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { ActiveMembersListData, ActiveMembersListModel } from './active-members-list.types';

export const useActiveMembersListController = (model: ActiveMembersListModel): ActiveMembersListData => {
  const card = useCardState();
  const [isPending, setIsPending] = useState(false);
  const pendingAction = useRef<Promise<void> | null>(null);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const runAction = (effect: () => Promise<void>): Promise<void> => {
    if (!isMounted.current) {
      return Promise.resolve();
    }
    if (pendingAction.current) {
      return pendingAction.current;
    }
    setIsPending(true);
    card.setError(undefined);
    const pending = (async () => effect())()
      .catch(error => {
        if (isMounted.current) {
          handleError(error, [], card.setError);
        }
      })
      .finally(() => {
        pendingAction.current = null;
        if (isMounted.current) {
          setIsPending(false);
        }
      });
    pendingAction.current = pending;
    return pending;
  };

  return {
    hasOrganization: model.hasOrganization,
    table: model.table,
    members: model.members.map(member => {
      // TODO: Find a way to disable Role select based on last admin by using permissions
      const canChangeRole =
        !!member.view.canManageMemberships && !model.hasRoleSetMigration && !member.preview.isDeprovisioned;
      const canRemove =
        !!member.view.canManageMemberships && !member.preview.isCurrentUser && !member.preview.isDeprovisioned;
      return {
        id: member.id,
        view: member.view,
        preview: member.preview,
        interaction: {
          onRoleChange: role => (canChangeRole ? runAction(() => member.updateRole(role)) : Promise.resolve()),
          onRemove: () => (canRemove ? runAction(member.remove) : Promise.resolve()),
          isRoleSelectDisabled: card.isLoading || isPending || !canChangeRole,
          isRemoveDisabled: card.isLoading || isPending || !canRemove,
        },
      };
    }),
  };
};
