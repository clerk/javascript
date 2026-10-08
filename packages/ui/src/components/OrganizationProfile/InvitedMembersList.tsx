import { useInvitedMembersListController } from './invited-members-list.controller';
import { useInvitedMembersListModel } from './invited-members-list.model';
import type { InvitedMembersListModel } from './invited-members-list.types';
import { InvitationRowView, InvitedMembersListView } from './invited-members-list.view';

export const InvitedMembersList = () => {
  const model = useInvitedMembersListModel();
  return model.hasOrganization ? (
    <List
      key={model.scope}
      model={model}
    />
  ) : null;
};

const List = ({ model }: { model: InvitedMembersListModel }) => {
  const data = useInvitedMembersListController(model);
  return (
    <InvitedMembersListView
      table={data.table}
      rows={data.invitations.map(row => (
        <InvitationRowView
          key={row.id}
          data={row.view}
          controller={row.interaction}
        />
      ))}
    />
  );
};
