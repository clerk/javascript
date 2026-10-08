import type { ReactNode } from 'react';

import { Button, descriptors, Flex, localizationKeys } from '@/customizables';
import { Action } from '@/ui/elements/Action';
import { Animated } from '@/ui/elements/Animated';
import { Tooltip } from '@/ui/elements/Tooltip';

export const MembersActionsRowView = ({
  canManageMemberships,
  isBelowLimit,
  actionSlot,
  inviteScreen,
}: {
  canManageMemberships: boolean;
  isBelowLimit: boolean;
  actionSlot?: ReactNode;
  inviteScreen: ReactNode;
}) => {
  const hasActionSlot = Boolean(actionSlot);
  const inviteButton = (
    <Button
      elementDescriptor={descriptors.membersPageInviteButton}
      aria-label='Invite'
      localizationKey={localizationKeys('organizationProfile.membersPage.action__invite')}
      isDisabled={!isBelowLimit}
    />
  );

  let wrappedInviteButton: ReactNode;
  if (isBelowLimit) {
    wrappedInviteButton = (
      <Action.Trigger
        value='invite'
        hideOnActive={!hasActionSlot}
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
          justify={hasActionSlot ? 'between' : 'end'}
          sx={theme => ({
            width: '100%',
            marginInlineStart: 'auto',
            padding: `${theme.space.$none} ${theme.space.$1}`,
          })}
          gap={hasActionSlot ? 2 : undefined}
        >
          {actionSlot}
          {canManageMemberships && wrappedInviteButton}
        </Flex>
      </Animated>
      {canManageMemberships && (
        <Animated>
          <Action.Open value='invite'>
            <Flex
              sx={theme => ({
                paddingBottom: theme.space.$6,
                padding: `${theme.space.$none} ${theme.space.$1} ${theme.space.$6} ${theme.space.$1}`,
              })}
            >
              <Action.Card sx={{ width: '100%' }}>{inviteScreen}</Action.Card>
            </Flex>
          </Action.Open>
        </Animated>
      )}
    </Action.Root>
  );
};
