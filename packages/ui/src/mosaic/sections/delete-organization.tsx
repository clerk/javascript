import { SectionSkeleton } from '../components/section-skeleton';
import { useDeleteOrganizationController } from './delete-organization-controller';
import { DeleteOrganizationView } from './delete-organization-view';

export function DeleteOrganization() {
  const controller = useDeleteOrganizationController();
  if (controller.status === 'loading') return <SectionSkeleton />;
  return (
    <DeleteOrganizationView
      snapshot={controller.snapshot}
      send={controller.send}
      canSubmit={controller.canSubmit}
    />
  );
}
