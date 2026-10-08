import type { ReactNode } from 'react';

import { InviteMembersScreen } from './InviteMembersScreen';
import { useMembersActionsModel } from './members-actions.model';
import { MembersActionsRowView } from './members-actions.view';

type MembersActionsRowProps = {
  actionSlot?: ReactNode;
};

export const MembersActionsRow = ({ actionSlot }: MembersActionsRowProps) => {
  const model = useMembersActionsModel();

  return (
    <MembersActionsRowView
      canManageMemberships={model.canManageMemberships}
      isBelowLimit={model.isBelowLimit}
      actionSlot={actionSlot}
      inviteScreen={<InviteMembersScreen />}
    />
  );
};
