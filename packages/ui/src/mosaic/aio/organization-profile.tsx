import { LeaveOrganization } from '../sections/leave-organization';

interface OrganizationProfileProps {
  organizationName: string;
}

export function OrganizationProfile({ organizationName }: OrganizationProfileProps) {
  return (
    <>
      <h1>Organization Profile</h1>
      <LeaveOrganization organizationName={organizationName} />
    </>
  );
}
