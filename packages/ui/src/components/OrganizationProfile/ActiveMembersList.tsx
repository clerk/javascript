import { useActiveMembersListController } from './active-members-list.controller';
import type { ActiveMembersListModel } from './active-members-list.types';
import { ActiveMembersListView, MemberRowView } from './active-members-list.view';

export type ActiveMembersListProps = {
  model: ActiveMembersListModel;
};

export const ActiveMembersList = ({ model }: ActiveMembersListProps) => {
  const data = useActiveMembersListController(model);

  if (!data.hasOrganization) {
    return null;
  }

  return (
    <ActiveMembersListView
      table={data.table}
      rows={data.members.map(member => (
        <MemberRowView
          key={member.id}
          data={member.view}
          preview={member.preview}
          controller={member.interaction}
        />
      ))}
    />
  );
};
