import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { InvitedMembersListData, InvitedMembersListModel } from './invited-members-list.types';

export const useInvitedMembersListController = (model: InvitedMembersListModel): InvitedMembersListData => {
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

  const run = (effect: () => Promise<void>): Promise<void> => {
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
    table: model.table,
    invitations: model.invitations.map(invitation => ({
      id: invitation.id,
      view: invitation.view,
      interaction: { onRevoke: () => run(invitation.revoke), isDisabled: isPending || card.isLoading },
    })),
  };
};
