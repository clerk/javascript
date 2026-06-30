import type { ReactElement } from 'react';

import { useDeleteOrganizationController } from './delete-organization.controller';
import { DeleteOrganizationView } from './delete-organization.view';

export function DeleteOrganization(): ReactElement | null {
  const controller = useDeleteOrganizationController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <DeleteOrganizationView
      snapshot={controller.snapshot}
      send={controller.send}
      canSubmit={controller.canSubmit}
    />
  );
}
