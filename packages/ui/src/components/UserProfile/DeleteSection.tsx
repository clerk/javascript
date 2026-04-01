import { ProfileSection } from '@/ui/elements/Section';

import { localizationKeys } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { mqu } from '../../styledSystem';
import { DeleteUserForm } from './DeleteUserForm';

const DeleteUserScreen = () => {
  const { close } = useActionContext();
  return (
    <DeleteUserForm
      onSuccess={close}
      onReset={close}
    />
  );
};

export const DeleteSection = () => {
  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.dangerSection.title')}
      id='danger'
      sx={{ alignItems: 'center', [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <Action.Root>
        <Action.Closed value='delete'>
          <ProfileSection.Item
            id='danger'
            sx={t => ({ paddingInlineStart: t.space.$1 })}
          >
            <Action.Trigger value='delete'>
              <ProfileSection.Button
                id='danger'
                variant='ghost'
                colorScheme='danger'
                localizationKey={localizationKeys('userProfile.start.dangerSection.deleteAccountButton')}
              />
            </Action.Trigger>
          </ProfileSection.Item>
        </Action.Closed>

        <Action.Open value='delete'>
          <Action.Card variant='destructive'>
            <DeleteUserScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};
