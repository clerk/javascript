import { OrganizationProfileDangerSection } from './organization-profile-danger-section/organization-profile-danger-section';
import { useOrganizationProfileGeneralPanelModel } from './organization-profile-general-panel.model';
import { OrganizationProfileGeneralPanelView } from './organization-profile-general-panel.view';

export function OrganizationProfileGeneralPanel({
  fallback,
  afterLeaveOrganizationUrl,
}: {
  fallback?: React.ReactNode;
  afterLeaveOrganizationUrl?: string;
}) {
  const model = useOrganizationProfileGeneralPanelModel();

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }

  const { status, organizationId, ...general } = model;
  return (
    <OrganizationProfileGeneralPanelView
      key={organizationId}
      {...general}
      dangerSlot={<OrganizationProfileDangerSection afterLeaveOrganizationUrl={afterLeaveOrganizationUrl} />}
    />
  );
}
