import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useOrganizationList, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';

import { sharedMainIdentifierSx } from '@/ui/common/organizations/OrganizationPreview';
import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { handleError } from '@/ui/utils/errorHandler';

import { useOrganizationListContext } from '../../contexts';
import { OrganizationListPreviewButton } from './shared';

export const MembershipPreview = (props: { organization: OrganizationResource }) => {
  const { user } = useUser();
  const card = useCardState();
  const { navigateAfterSelectOrganization } = useOrganizationListContext();
  const { t } = useLocalizations();
  const { isLoaded, setSelected } = useOrganizationList();

  if (!isLoaded) {
    return null;
  }

  const handleOrganizationClicked = (organization: OrganizationResource) => {
    return card.runAsync(async () => {
      try {
        await setSelected({
          organization,
        });

        await navigateAfterSelectOrganization(organization);
      } catch (err: any) {
        if (!isClerkAPIResponseError(err)) {
          handleError(err, [], card.setError);
          return;
        }

        switch (err.errors?.[0]?.code) {
          case 'organization_not_found_or_unauthorized':
          case 'not_a_member_in_organization': {
            if (user?.createOrganizationEnabled) {
              card.setError(t(localizationKeys('unstable__errors.organization_not_found_or_unauthorized')));
            } else {
              card.setError(
                t(
                  localizationKeys(
                    'unstable__errors.organization_not_found_or_unauthorized_with_create_organization_disabled',
                  ),
                ),
              );
            }
            break;
          }
          default: {
            handleError(err, [], card.setError);
          }
        }
      }
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
};

export const PersonalAccountPreview = withCardStateProvider(() => {
  const card = useCardState();
  const { hidePersonal, navigateAfterSelectPersonal } = useOrganizationListContext();
  const { isLoaded, setSelected } = useOrganizationList();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet, username, ...userWithoutIdentifiers } = user;

  const handlePersonalClicked = () => {
    if (!isLoaded) {
      return;
    }
    return card.runAsync(async () => {
      await setSelected({
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
