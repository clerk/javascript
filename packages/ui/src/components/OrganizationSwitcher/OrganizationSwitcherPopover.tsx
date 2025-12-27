import { useClerk, useOrganization, useOrganizationList, usePortalRoot, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import React from 'react';

import { Actions, SmallAction } from '@/ui/elements/Actions';
import { useCardState } from '@/ui/elements/contexts';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { PopoverCard } from '@/ui/elements/PopoverCard';

import { NotificationCountBadge, withProtect } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import { descriptors, Flex, localizationKeys } from '../../customizables';
import { RootBox } from '../../elements/RootBox';
import { CogFilled } from '../../icons';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { OrganizationActionList } from './OtherOrganizationActions';

type OrganizationSwitcherPopoverProps = { close?: (open: boolean) => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const OrganizationSwitcherPopover = React.forwardRef<HTMLDivElement, OrganizationSwitcherPopoverProps>(
  (props, ref) => {
    const { close: unsafeClose, ...rest } = props;
    const close = () => unsafeClose?.(false);
    const card = useCardState();
    const { __experimental_asStandalone } = useOrganizationSwitcherContext();
    const { openOrganizationProfile, openCreateOrganization } = useClerk();
    const getContainer = usePortalRoot();
    const { organization: currentOrg } = useOrganization();
    const { isLoaded, setActive } = useOrganizationList();
    const {
      hidePersonal,
      createOrganizationMode,
      organizationProfileMode,
      afterLeaveOrganizationUrl,
      afterCreateOrganizationUrl,
      navigateCreateOrganization,
      navigateOrganizationProfile,
      afterSelectOrganizationUrl,
      afterSelectPersonalUrl,

      organizationProfileProps,
      skipInvitationScreen,
    } = useOrganizationSwitcherContext();

    const { user } = useUser();

    if (!user) {
      return null;
    }

    const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

    if (!isLoaded) {
      return null;
    }

    const handleOrganizationClicked = (organization: OrganizationResource) => {
      return card
        .runAsync(() =>
          setActive({
            organization,
            redirectUrl: afterSelectOrganizationUrl(organization),
          }),
        )
        .then(close);
    };

    const handlePersonalWorkspaceClicked = () => {
      return card
        .runAsync(() => setActive({ organization: null, redirectUrl: afterSelectPersonalUrl(user) }))
        .then(close);
    };

    const handleCreateOrganizationClicked = () => {
      close();
      if (createOrganizationMode === 'navigation') {
        return navigateCreateOrganization();
      }
      return openCreateOrganization({ afterCreateOrganizationUrl, skipInvitationScreen, getContainer });
    };

    const handleItemClick = () => {
      close();
      if (organizationProfileMode === 'navigation') {
        return navigateOrganizationProfile();
      }

      return openOrganizationProfile({
        ...organizationProfileProps,
        afterLeaveOrganizationUrl,
        getContainer,
      });
    };

    const manageOrganizationButton = (
      <SmallAction
        elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
        elementId={descriptors.organizationSwitcherPopoverActionButton.setId('manageOrganization')}
        iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('manageOrganization')}
        iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
        iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('manageOrganization')}
        icon={CogFilled}
        label={localizationKeys('organizationSwitcher.action__manageOrganization')}
        onClick={() => handleItemClick()}
        trailing={<NotificationCountBadgeManageButton />}
        focusRing
      />
    );

    const selectedOrganizationPreview = (currentOrg: OrganizationResource) => (
      <Flex
        justify='between'
        align='center'
        sx={t => ({
          width: '100%',
          paddingRight: t.space.$5,
        })}
      >
        <OrganizationPreview
          elementId={'organizationSwitcherActiveOrganization'}
          organization={currentOrg}
          user={user}
          mainIdentifierVariant='buttonLarge'
          sx={t => ({
            padding: `${t.space.$4} ${t.space.$5}`,
          })}
        />
        <Actions role='menu'>{manageOrganizationButton}</Actions>
      </Flex>
    );

    return (
      <RootBox elementDescriptor={descriptors.organizationSwitcherPopoverRootBox}>
        <PopoverCard.Root
          elementDescriptor={descriptors.organizationSwitcherPopoverCard}
          ref={ref}
          role='dialog'
          aria-label={`${currentOrg?.name} is active`}
          shouldEntryAnimate={!__experimental_asStandalone}
          {...rest}
        >
          <PopoverCard.Content elementDescriptor={descriptors.organizationSwitcherPopoverMain}>
            <Actions
              elementDescriptor={descriptors.organizationSwitcherPopoverActions}
              role='menu'
            >
              {currentOrg
                ? selectedOrganizationPreview(currentOrg)
                : !hidePersonal && (
                    <PersonalWorkspacePreview
                      user={userWithoutIdentifiers}
                      sx={t => ({
                        padding: `${t.space.$4} ${t.space.$5}`,
                        width: '100%',
                      })}
                      title={localizationKeys('organizationSwitcher.personalWorkspace')}
                    />
                  )}
              <OrganizationActionList
                onCreateOrganizationClick={handleCreateOrganizationClicked}
                onPersonalWorkspaceClick={handlePersonalWorkspaceClicked}
                onOrganizationClick={handleOrganizationClicked}
              />
            </Actions>
          </PopoverCard.Content>
          <PopoverCard.Footer elementDescriptor={descriptors.organizationSwitcherPopoverFooter} />
        </PopoverCard.Root>
      </RootBox>
    );
  },
);

const NotificationCountBadgeManageButton = withProtect(
  ({ sx }: { sx?: ThemableCssProp }) => {
    const { organizationSettings } = useEnvironment();

    const isDomainsEnabled = organizationSettings?.domains?.enabled;

    const { membershipRequests } = useOrganization({
      membershipRequests: isDomainsEnabled || undefined,
    });

    if (!membershipRequests?.count) {
      return null;
    }

    return (
      <NotificationCountBadge
        notificationCount={membershipRequests.count}
        containerSx={sx}
      />
    );
  },
  {
    // if the user is not able to accept a request we should not notify them
    permission: 'org:sys_memberships:manage',
  },
);
