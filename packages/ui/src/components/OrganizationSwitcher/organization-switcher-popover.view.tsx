import { forwardRef, type ReactNode } from 'react';

import { Actions, SmallAction } from '@/ui/elements/Actions';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { PopoverCard } from '@/ui/elements/PopoverCard';

import { NotificationCountBadge } from '../../common';
import { descriptors, Flex } from '../../customizables';
import { RootBox } from '../../elements/RootBox';
import { Cog } from '../../icons';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { organizationSwitcherMessages } from './organization-switcher.messages';
import type { OrganizationSwitcherPopoverData } from './organization-switcher-popover.types';
import { OrganizationActionList } from './OtherOrganizationActions';
import type { UserMembershipListProps } from './UserMembershipList';

type OrganizationSwitcherPopoverViewProps = PropsOfComponent<typeof PopoverCard.Root> &
  OrganizationSwitcherPopoverData & {
    onPersonalWorkspaceClick: () => Promise<boolean>;
    onCreateOrganizationClick: () => unknown;
    onManageOrganizationClick: () => unknown;
    onOrganizationClick: UserMembershipListProps['onOrganizationClick'];
    manageBadge: ReactNode;
  };

export const OrganizationSwitcherPopoverView = forwardRef<HTMLDivElement, OrganizationSwitcherPopoverViewProps>(
  (props, ref) => {
    const {
      isReady,
      isStandalone,
      hidePersonal,
      currentOrgPreview,
      userRolePreview,
      personalPreview,
      onPersonalWorkspaceClick,
      onCreateOrganizationClick,
      onManageOrganizationClick,
      onOrganizationClick,
      manageBadge,
      ...rest
    } = props;

    if (!isReady) {
      return null;
    }

    const manageOrganizationButton = (
      <SmallAction
        elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
        elementId={descriptors.organizationSwitcherPopoverActionButton.setId('manageOrganization')}
        iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('manageOrganization')}
        iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
        iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('manageOrganization')}
        icon={Cog}
        label={organizationSwitcherMessages.manage.settings}
        onClick={() => void onManageOrganizationClick()}
        trailing={manageBadge}
        focusRing
      />
    );

    return (
      <RootBox elementDescriptor={descriptors.organizationSwitcherPopoverRootBox}>
        <PopoverCard.Root
          elementDescriptor={descriptors.organizationSwitcherPopoverCard}
          ref={ref}
          role='dialog'
          aria-label={`${currentOrgPreview?.name} is active`}
          shouldEntryAnimate={!isStandalone}
          {...rest}
        >
          <PopoverCard.Content elementDescriptor={descriptors.organizationSwitcherPopoverMain}>
            <Actions elementDescriptor={descriptors.organizationSwitcherPopoverActions}>
              {currentOrgPreview ? (
                <Flex
                  justify='between'
                  align='center'
                  sx={t => ({
                    width: '100%',
                    paddingInlineEnd: t.space.$5,
                  })}
                >
                  <OrganizationPreview
                    elementId={'organizationSwitcherActiveOrganization'}
                    organization={currentOrgPreview}
                    user={userRolePreview}
                    mainIdentifierVariant='buttonLarge'
                    sx={t => ({ padding: `${t.space.$4} ${t.space.$5}` })}
                  />
                  <Actions>{manageOrganizationButton}</Actions>
                </Flex>
              ) : (
                !hidePersonal && (
                  <PersonalWorkspacePreview
                    user={personalPreview}
                    sx={t => ({
                      padding: `${t.space.$4} ${t.space.$5}`,
                      width: '100%',
                    })}
                    title={organizationSwitcherMessages.organizations.personal}
                  />
                )
              )}
              <OrganizationActionList
                onCreateOrganizationClick={onCreateOrganizationClick}
                onPersonalWorkspaceClick={() => void onPersonalWorkspaceClick()}
                onOrganizationClick={onOrganizationClick}
              />
            </Actions>
          </PopoverCard.Content>
          <PopoverCard.Footer elementDescriptor={descriptors.organizationSwitcherPopoverFooter} />
        </PopoverCard.Root>
      </RootBox>
    );
  },
);

export const OrganizationSwitcherManageNotificationView = ({
  notificationCount,
  sx,
}: {
  notificationCount: number;
  sx?: ThemableCssProp;
}) => {
  if (!notificationCount) {
    return null;
  }

  return (
    <NotificationCountBadge
      notificationCount={notificationCount}
      containerSx={sx}
    />
  );
};
