import type { OrganizationMembershipResource, OrganizationResource } from '@clerk/types';

import { useCoreOrganizationList, useCoreUser, useOrganizationListContext } from '../../contexts';
import { OrganizationPreview, PersonalWorkspacePreview, useCardState, withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import { OrganizationListPreviewButton } from './shared';

export const MembershipPreview = withCardStateProvider((props: OrganizationMembershipResource) => {
  const card = useCardState();
  const { navigateAfterSelectOrganization } = useOrganizationListContext();
  const { isLoaded, setActive } = useCoreOrganizationList();

  if (!isLoaded) {
    return null;
  }
  const handleOrganizationClicked = (organization: OrganizationResource) => {
    return card.runAsync(() =>
      setActive({
        organization,
        beforeEmit: () => navigateAfterSelectOrganization(organization),
      }),
    );
  };
  return (
    <OrganizationListPreviewButton onClick={() => handleOrganizationClicked(props.organization)}>
      <OrganizationPreview
        elementId='organizationList'
        avatarSx={t => ({ width: t.sizes.$10, height: t.sizes.$10 })}
        mainIdentifierSx={t => ({
          fontSize: t.fontSizes.$xl,
          color: t.colors.$colorText,
        })}
        organization={props.organization}
      />
    </OrganizationListPreviewButton>
  );
});
export const PersonalAccountPreview = withCardStateProvider(() => {
  const card = useCardState();
  const { hidePersonal, navigateAfterSelectPersonal } = useOrganizationListContext();
  const { isLoaded, setActive } = useCoreOrganizationList();
  const user = useCoreUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

  const handlePersonalClicked = () => {
    if (!isLoaded) {
      return;
    }
    return card.runAsync(() =>
      setActive({
        organization: null,
        beforeEmit: () => navigateAfterSelectPersonal(user),
      }),
    );
  };

  if (hidePersonal) {
    return null;
  }

  return (
    <OrganizationListPreviewButton onClick={handlePersonalClicked}>
      <PersonalWorkspacePreview
        user={userWithoutIdentifiers}
        avatarSx={t => ({ width: t.sizes.$10, height: t.sizes.$10 })}
        mainIdentifierSx={t => ({
          fontSize: t.fontSizes.$xl,
          color: t.colors.$colorText,
        })}
        title={localizationKeys('organizationSwitcher.personalWorkspace')}
      />
    </OrganizationListPreviewButton>
  );
});
