import { DeleteOrganization } from '../sections/delete-organization';
import { LeaveOrganization } from '../sections/leave-organization';
import { OrganizationProfileGeneralView } from './organization-profile-general-view';

export function OrganizationProfileGeneral() {
  return (
    <OrganizationProfileGeneralView
      leaveOrganization={<LeaveOrganization />}
      deleteOrganization={<DeleteOrganization />}
    />
  );
}
