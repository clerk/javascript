import { OrganizationMembersTab } from './organization-members-tab';
import { RequestToJoinList } from './RequestToJoinList';

export const OrganizationMembersTabRequests = () => (
  <OrganizationMembersTab
    kind='requests'
    list={<RequestToJoinList />}
  />
);
