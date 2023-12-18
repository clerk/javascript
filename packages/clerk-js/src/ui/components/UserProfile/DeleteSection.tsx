import { Button, localizationKeys } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { DeleteUserForm } from './DeleteUserPage';

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
          <Action.Card isDestructive>
            <DeleteUserForm />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};
