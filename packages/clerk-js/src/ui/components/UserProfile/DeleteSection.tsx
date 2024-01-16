import { Button, localizationKeys } from '../../customizables';
import { ProfileSection } from '../../elements';
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
            sx={t => ({
              padding: `${t.space.$1x5} ${t.space.$none} ${t.space.$1x5} ${t.space.$3}`,
            })}
          >
            <Action.Trigger value='delete'>
              <Button
                id='danger'
                variant='ghostDanger'
                textVariant='buttonSmall'
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
