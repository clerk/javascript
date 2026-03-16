import { useMemo } from 'react';
import { useOrganization } from '@clerk/shared/react';
import { Animated } from '@/ui/elements/Animated';
import { Tooltip } from '@/ui/elements/Tooltip';

import { useProtect } from '../../common';
import { Button, descriptors, Flex, localizationKeys } from '../../customizables';
import { Action } from '../../elements/Action';
import { InviteMembersScreen } from './InviteMembersScreen';

type MembersActionsRowProps = {
  actionSlot?: React.ReactNode;
};

export const MembersActionsRow = ({ actionSlot }: MembersActionsRowProps) => {
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });
  const { organization } = useOrganization();

  const isBelowLimit = useMemo(() => {
    if (!organization) {
      return false;
    }

    if (organization.maxAllowedMemberships === 0) {
      return true;
    }

    return organization.membersCount + organization.pendingInvitationsCount < organization.maxAllowedMemberships;
  }, [organization]);

  const inviteButton = (
    <Button
      elementDescriptor={descriptors.membersPageInviteButton}
      aria-label='Invite'
      localizationKey={localizationKeys('organizationProfile.membersPage.action__invite')}
      isDisabled={!isBelowLimit}
    />
  );

  let wrappedInviteButton;
  if (isBelowLimit) {
    wrappedInviteButton = (
      <Action.Trigger
        value='invite'
        hideOnActive={!actionSlot}
      >
        {inviteButton}
      </Action.Trigger>
    );
  } else {
    wrappedInviteButton = (
      <Tooltip.Root>
        <Tooltip.Trigger>{inviteButton}</Tooltip.Trigger>
        <Tooltip.Content text={localizationKeys('unstable__errors.organization_membership_quota_exceeded')} />
      </Tooltip.Root>
    );
  }

  return (
    <Action.Root animate={false}>
      <Animated asChild>
        <Flex
          justify={actionSlot ? 'between' : 'end'}
          sx={t => ({
            width: '100%',
            marginInlineStart: 'auto',
            padding: `${t.space.$none} ${t.space.$1}`,
          })}
          gap={actionSlot ? 2 : undefined}
        >
          {actionSlot}
          {canManageMemberships && wrappedInviteButton}
        </Flex>
      </Animated>
      {canManageMemberships && (
        <Animated>
          <Action.Open value='invite'>
            <Flex
              sx={t => ({
                paddingBottom: t.space.$6,
                padding: `${t.space.$none} ${t.space.$1} ${t.space.$6} ${t.space.$1}`,
              })}
            >
              <Action.Card
                sx={{
                  width: '100%',
                }}
              >
                <InviteMembersScreen />
              </Action.Card>
            </Flex>
          </Action.Open>
        </Animated>
      )}
    </Action.Root>
  );
};
