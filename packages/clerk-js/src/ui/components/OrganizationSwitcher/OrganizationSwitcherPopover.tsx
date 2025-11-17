import { useClerk, useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import React from 'react';

import { Actions, SmallAction } from '@/ui/elements/Actions';
import { useCardState } from '@/ui/elements/contexts';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { PopoverCard } from '@/ui/elements/PopoverCard';

import { runIfFunctionOrReturn } from '../../../utils';
import { NotificationCountBadge, withProtect } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import { usePortalConfig } from '../../contexts/PortalContext';
import { descriptors, Flex, localizationKeys } from '../../customizables';
import { RootBox } from '../../elements/RootBox';
import { Billing, CogFilled } from '../../icons';
import { useRouter } from '../../router';
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
    const { organization: currentOrg } = useOrganization();
    const { isLoaded, setActive } = useOrganizationList();
    const router = useRouter();
    const portalConfig = usePortalConfig();
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
      afterSelectOrganizationUrl,
      afterSelectPersonalUrl,

      organizationProfileProps,
      skipInvitationScreen,
      hideSlug,
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
      return openCreateOrganization({
        afterCreateOrganizationUrl,
        skipInvitationScreen,
        hideSlug,
        // Pass portal config from OrganizationSwitcher context to CreateOrganization modal
        ...portalConfig,
      });
    };

    const handleItemClick = () => {
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
        // Pass portal config from OrganizationSwitcher context to OrganizationProfile modal
        ...portalConfig,
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

    const billingOrganizationButton = (
      <SmallAction
        icon={Billing}
        label={runIfFunctionOrReturn(__unstable_manageBillingLabel) || 'Upgrade'}
        onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
        focusRing
      />
    );

    const selectedOrganizationPreview = (currentOrg: OrganizationResource) =>
      __unstable_manageBillingUrl ? (
        <>
          <OrganizationPreview
            elementId={'organizationSwitcherActiveOrganization'}
            organization={currentOrg}
            user={user}
            mainIdentifierVariant='buttonLarge'
            sx={t => ({
              padding: `${t.space.$4} ${t.space.$5}`,
            })}
          />
          <Actions
            role='menu'
            sx={t => ({
              borderBottomWidth: t.borderWidths.$normal,
              borderBottomStyle: t.borderStyles.$solid,
              borderBottomColor: t.colors.$borderAlpha100,
            })}
          >
            <Flex
              justify='between'
              sx={t => ({
                marginLeft: t.space.$12,
                padding: `0 ${t.space.$5} ${t.space.$4}`,
                gap: t.space.$2,
              })}
            >
              {manageOrganizationButton}
              {billingOrganizationButton}
            </Flex>
          </Actions>
        </>
      ) : (
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
