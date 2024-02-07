import type { OrganizationResource } from '@clerk/types';
import React from 'react';

import { runIfFunctionOrReturn } from '../../../utils';
import { NotificationCountBadge, withGate } from '../../common';
import {
  useCoreClerk,
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useEnvironment,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { descriptors, localizationKeys } from '../../customizables';
import {
  Action,
  Actions,
  OrganizationPreview,
  PersonalWorkspacePreview,
  PopoverCard,
  useCardState,
} from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { Billing, CogFilled } from '../../icons';
import { useRouter } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
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
      //@ts-expect-error
      __unstable_manageBillingUrl,
      //@ts-expect-error
      __unstable_manageBillingLabel,
      //@ts-expect-error
      __unstable_manageBillingMembersLimit,
      createOrganizationMode,
      organizationProfileMode,
      afterLeaveOrganizationUrl,
      afterCreateOrganizationUrl,
      navigateCreateOrganization,
      navigateOrganizationProfile,
      navigateAfterSelectPersonal,
      navigateAfterSelectOrganization,
      organizationProfileProps,
      skipInvitationScreen,
    } = useOrganizationSwitcherContext();

    const user = useCoreUser();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

    if (!isLoaded) {
      return null;
    }

    const handleOrganizationClicked = (organization: OrganizationResource) => {
      return card
        .runAsync(() =>
          setActive({
            organization,
            beforeEmit: () => navigateAfterSelectOrganization(organization),
          }),
        )
        .then(close);
    };

    const handlePersonalWorkspaceClicked = () => {
      return card
        .runAsync(() => setActive({ organization: null, beforeEmit: () => navigateAfterSelectPersonal(user) }))
        .then(close);
    };

    const handleCreateOrganizationClicked = () => {
      close();
      if (createOrganizationMode === 'navigation') {
        return navigateCreateOrganization();
      }
      return openCreateOrganization({ afterCreateOrganizationUrl, skipInvitationScreen });
    };

    const handleManageOrganizationClicked = () => {
      close();
      if (organizationProfileMode === 'navigation') {
        return navigateOrganizationProfile();
      }
      return openOrganizationProfile({
        ...organizationProfileProps,
        afterLeaveOrganizationUrl,
        //@ts-expect-error
        __unstable_manageBillingUrl,
        __unstable_manageBillingLabel,
        __unstable_manageBillingMembersLimit,
      });
    };

    const manageOrganizationButton = (
      <Action
        elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
        elementId={descriptors.organizationSwitcherPopoverActionButton.setId('manageOrganization')}
        iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('manageOrganization')}
        iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
        iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('manageOrganization')}
        textElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonText}
        textElementId={descriptors.organizationSwitcherPopoverActionButtonText.setId('manageOrganization')}
        icon={CogFilled}
        label={localizationKeys('organizationSwitcher.action__manageOrganization')}
        onClick={handleManageOrganizationClicked}
        trailing={<NotificationCountBadgeManageButton />}
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
          role='dialog'
          aria-label={`${currentOrg?.name} is active`}
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
                  fetchRoles
                  sx={theme => t => ({ padding: `0 ${theme.space.$6}`, marginBottom: t.space.$2 })}
                />
                <Actions role='menu'>
                  {manageOrganizationButton}
                  {__unstable_manageBillingUrl && billingOrganizationButton}
                </Actions>
              </>
            ) : (
              !hidePersonal && (
                <PersonalWorkspacePreview
                  gap={4}
                  user={userWithoutIdentifiers}
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

const NotificationCountBadgeManageButton = withGate(
  () => {
    const { organizationSettings } = useEnvironment();

    const isDomainsEnabled = organizationSettings?.domains?.enabled;

    const { membershipRequests } = useCoreOrganization({
      membershipRequests: isDomainsEnabled || undefined,
    });

    return <NotificationCountBadge notificationCount={membershipRequests?.count || 0} />;
  },
  {
    // if the user is not able to accept a request we should not notify them
    permission: 'org:sys_memberships:manage',
  },
);
