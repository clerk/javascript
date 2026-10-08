import type { OrganizationListMembership, OrganizationListPersonalAccount } from './organization-list.types';
import { MembershipView, PersonalAccountView } from './organization-list-membership.view';
import { useOrganizationListSelectionController } from './organization-list-selection.controller';

export const MembershipPreview = ({ model }: { model: OrganizationListMembership }) => {
  const onClick = useOrganizationListSelectionController(model.selectOrganization, model.getUnauthorizedError, model);

  return (
    <MembershipView
      isVisible={model.isLoaded}
      organizationPreview={model.organizationPreview}
      onClick={onClick}
    />
  );
};

export const PersonalAccountPreview = ({ model }: { model: OrganizationListPersonalAccount }) => {
  const onClick = useOrganizationListSelectionController(model.selectPersonal, undefined, model);

  return (
    <PersonalAccountView
      isVisible={model.isVisible}
      user={model.user}
      onClick={onClick}
    />
  );
};
