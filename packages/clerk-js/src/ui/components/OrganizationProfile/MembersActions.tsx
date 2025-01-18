import { useProtect } from '../../common';
import { Button, descriptors, Flex, localizationKeys } from '../../customizables';
import { Animated } from '../../elements';
import { Action } from '../../elements/Action';
import { InviteMembersScreen } from './InviteMembersScreen';

export const MembersActionsRow = () => {
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });

  return (
    <Action.Root animate={false}>
      <Animated asChild>
        <Flex
          justify='end'
          sx={t => ({
            // TODO  - See if this would break the component in other places
            marginLeft: 'auto',
            padding: `${t.space.$none} ${t.space.$1}`,
          })}
        >
          {canManageMemberships && (
            <Action.Trigger value='invite'>
              <Button
                elementDescriptor={descriptors.membersPageInviteButton}
                aria-label='Invite'
                textVariant='buttonSmall'
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
