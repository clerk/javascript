import { Button, localizationKeys } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
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
    >
      <Action.Root>
        <Action.Closed value='delete'>
          <Action.Trigger value='delete'>
            <Button
              id='danger'
              variant='ghostDanger'
              sx={{ alignSelf: 'start' }}
              localizationKey={localizationKeys('userProfile.start.dangerSection.deleteAccountButton')}
            />
          </Action.Trigger>
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
