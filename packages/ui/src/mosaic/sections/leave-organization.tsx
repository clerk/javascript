import { useLeaveOrganizationController } from './leave-organization.controller';
import { LeaveOrganizationView } from './leave-organization.view';

export function LeaveOrganization() {
  const controller = useLeaveOrganizationController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <LeaveOrganizationView
      snapshot={controller.snapshot}
      send={controller.send}
      canSubmit={controller.canSubmit}
    />
  );
}
