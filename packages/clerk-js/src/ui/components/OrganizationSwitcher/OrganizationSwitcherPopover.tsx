import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { runIfFunctionOrReturn } from '../../../utils';
import {
  useCoreClerk,
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { descriptors, Flex, localizationKeys } from '../../customizables';
import { Action, OrganizationPreview, PersonalWorkspacePreview, PopoverCard, useCardState } from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { Billing, CogFilled } from '../../icons';
import { useRouter } from '../../router';
import { PropsOfComponent } from '../../styledSystem';
import { OrganizationActionList } from './OtherOrganizationActions';

type OrganizationSwitcherPopoverProps = { close: () => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const OrganizationSwitcherPopover = React.forwardRef<HTMLDivElement, OrganizationSwitcherPopoverProps>(
  (props, ref) => {
    const { close, ...rest } = props;
    const card = useCardState();
    const { openOrganizationProfile, openCreateOrganization } = useCoreClerk();
    const { organization: currentOrg } = useCoreOrganization();
    const { isLoaded, setActive } = useCoreOrganizationList();
    const router = useRouter();
    const {
      hidePersonal,
      __unstable_manageBillingUrl,
      __unstable_manageBillingLabel,
      __unstable_manageBillingMembersLimit,
      createOrganizationMode,
      organizationProfileMode,
      afterLeaveOrganizationUrl,
      afterCreateOrganizationUrl,
      navigateCreateOrganization,
      navigateOrganizationProfile,
      navigateAfterSwitchOrganization,
    } = useOrganizationSwitcherContext();

    const user = useCoreUser();

    if (!isLoaded) {
      return null;
    }

    const handleOrganizationClicked = (organization: OrganizationResource) => {
      return card.runAsync(() => setActive({ organization, beforeEmit: navigateAfterSwitchOrganization })).then(close);
    };

    const handlePersonalWorkspaceClicked = () => {
      return card
        .runAsync(() => setActive({ organization: null, beforeEmit: navigateAfterSwitchOrganization }))
        .then(close);
    };

    const handleCreateOrganizationClicked = () => {
      close();
      if (createOrganizationMode === 'navigation') {
        return navigateCreateOrganization();
      }
      openCreateOrganization({ afterCreateOrganizationUrl });
    };

    const handleManageOrganizationClicked = () => {
      close();
      if (organizationProfileMode === 'navigation') {
        return navigateOrganizationProfile();
      }
      openOrganizationProfile({
        afterLeaveOrganizationUrl,
        __unstable_manageBillingUrl,
        __unstable_manageBillingLabel,
        __unstable_manageBillingMembersLimit,
      });
    };

    const manageOrganizationButton = (
      <Action
        icon={CogFilled}
        label={localizationKeys('organizationSwitcher.action__manageOrganization')}
        onClick={handleManageOrganizationClicked}
      />
    );

    const billingOrganizationButton = (
      <Action
        icon={Billing}
        label={runIfFunctionOrReturn(__unstable_manageBillingLabel) || 'Manage billing'}
        onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
      />
    );

    return (
      <RootBox elementDescriptor={descriptors.organizationSwitcherPopoverRootBox}>
        <PopoverCard.Root
          elementDescriptor={descriptors.organizationSwitcherPopoverCard}
          ref={ref}
          {...rest}
        >
          <PopoverCard.Main elementDescriptor={descriptors.organizationSwitcherPopoverMain}>
            {currentOrg ? (
              <>
                <OrganizationPreview
                  elementId={'organizationSwitcher'}
                  gap={4}
                  organization={currentOrg}
                  user={user}
                  sx={theme => ({ padding: `0 ${theme.space.$6}` })}
                />
                <Flex
                  direction='col'
                  sx={t => ({ margin: `${t.space.$2} 0` })}
                >
                  {manageOrganizationButton}
                  {__unstable_manageBillingUrl && billingOrganizationButton}
                </Flex>
              </>
            ) : (
              !hidePersonal && (
                <PersonalWorkspacePreview
                  gap={4}
                  user={{ profileImageUrl: user.profileImageUrl }}
                  sx={theme => ({ padding: `0 ${theme.space.$6}`, marginBottom: theme.space.$6 })}
                  title={localizationKeys('organizationSwitcher.personalWorkspace')}
                />
              )
            )}
            <OrganizationActionList
              onCreateOrganizationClick={handleCreateOrganizationClicked}
              onPersonalWorkspaceClick={handlePersonalWorkspaceClicked}
              onOrganizationClick={handleOrganizationClicked}
            />
          </PopoverCard.Main>
          <PopoverCard.Footer elementDescriptor={descriptors.organizationSwitcherPopoverFooter} />
        </PopoverCard.Root>
      </RootBox>
    );
  },
);
