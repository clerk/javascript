import { Animated } from '@/ui/elements/Animated';

import { useProtect } from '../../common';
import { Button, descriptors, Flex, localizationKeys } from '../../customizables';
import { Action } from '../../elements/Action';
import { InviteMembersScreen } from './InviteMembersScreen';

type MembersActionsRowProps = {
  actionSlot?: React.ReactNode;
};

export const MembersActionsRow = ({ actionSlot }: MembersActionsRowProps) => {
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });

  return (
    <Action.Root animate={false}>
      <Animated asChild>
        <Flex
          justify={actionSlot ? 'between' : 'end'}
          sx={t => ({
            width: '100%',
            marginLeft: 'auto',
            padding: `${t.space.$none} ${t.space.$1}`,
          })}
          gap={actionSlot ? 2 : undefined}
        >
          {actionSlot}
          {canManageMemberships && (
            <Action.Trigger
              value='invite'
              hideOnActive={!actionSlot}
            >
              <Button
                elementDescriptor={descriptors.membersPageInviteButton}
                aria-label='Invite'
                localizationKey={localizationKeys('organizationProfile.membersPage.action__invite')}
              />
            </Action.Trigger>
          )}
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
