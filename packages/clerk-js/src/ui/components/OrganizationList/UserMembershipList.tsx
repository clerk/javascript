import { useOrganizationList, useSession, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/types';

import { useOrganizationListContext } from '../../contexts';
import { OrganizationPreview, PersonalWorkspacePreview, useCardState, withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import { OrganizationListPreviewButton, sharedMainIdentifierSx } from './shared';

export const MembershipPreview = withCardStateProvider((props: { organization: OrganizationResource }) => {
  const card = useCardState();
  const { navigateAfterSelectOrganization } = useOrganizationListContext();
  const { isLoaded, setActive } = useOrganizationList();
  const { session } = useSession();

  if (!isLoaded) {
    return null;
  }
  const handleOrganizationClicked = (organization: OrganizationResource) => {
    return card.runAsync(async () => {
      await setActive({
        organization,
      });

      await session?.activate();

      await navigateAfterSelectOrganization(organization);
    });
  };
  return (
    <OrganizationListPreviewButton onClick={() => handleOrganizationClicked(props.organization)}>
      <OrganizationPreview
        elementId='organizationList'
        mainIdentifierSx={sharedMainIdentifierSx}
        organization={props.organization}
      />
    </OrganizationListPreviewButton>
  );
});
export const PersonalAccountPreview = withCardStateProvider(() => {
  const card = useCardState();
  const { hidePersonal, navigateAfterSelectPersonal } = useOrganizationListContext();
  const { isLoaded, setActive } = useOrganizationList();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

  const handlePersonalClicked = () => {
    if (!isLoaded) {
      return;
    }
    return card.runAsync(async () => {
      await setActive({
        organization: null,
      });

      await navigateAfterSelectPersonal(user);
    });
  };

  if (hidePersonal) {
    return null;
  }

  return (
    <OrganizationListPreviewButton onClick={handlePersonalClicked}>
      <PersonalWorkspacePreview
        user={userWithoutIdentifiers}
        mainIdentifierSx={sharedMainIdentifierSx}
        title={localizationKeys('organizationSwitcher.personalWorkspace')}
      />
    </OrganizationListPreviewButton>
  );
});
