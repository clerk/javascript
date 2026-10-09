import { useDestructiveController } from '../../../blocks/destructive/destructive.controller';
import type { OrganizationProfileDangerSectionModel } from './organization-profile-danger-section.model';
import { useOrganizationProfileDangerSectionModel } from './organization-profile-danger-section.model';
import { OrganizationProfileDangerSectionView } from './organization-profile-danger-section.view';

export type OrganizationProfileDangerSectionProps = {
  fallback?: React.ReactNode;
};

export function OrganizationProfileDangerSection(props: OrganizationProfileDangerSectionProps) {
  const model = useOrganizationProfileDangerSectionModel();

  if (model.status === 'loading') {
    return props.fallback ?? null;
  }

  if (model.status === 'hidden') {
    return null;
  }

  return (
    <OrganizationDangerZone
      key={model.organizationId}
      model={model}
    />
  );
}

function OrganizationDangerZone({
  model,
}: {
  model: Extract<OrganizationProfileDangerSectionModel, { status: 'ready' }>;
}) {
  const leave = useDestructiveController({ onDelete: model.leaveOrganization });
  const destroy = useDestructiveController({ onDelete: async () => model.deleteOrganization?.() });

  return (
    <OrganizationProfileDangerSectionView
      name={model.name}
      memberCount={model.memberCount}
      leave={leave}
      destroy={model.deleteOrganization ? destroy : undefined}
    />
  );
}
