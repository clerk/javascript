import { Button, localizationKeys } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { DeleteUserForm } from './DeleteUserPage';

export const DeleteSection = () => {
  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.dangerSection.title')}
      id='danger'
    >
      <Action.Root>
        <Action.Closed value='delete'>
          <Action.Trigger value='delete'>
            <Button
              variant='ghostDanger'
              textVariant='buttonSmall'
              sx={{ alignSelf: 'start' }}
              localizationKey={localizationKeys('userProfile.start.dangerSection.deleteAccountButton')}
            />
          </Action.Trigger>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <DeleteUserForm />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection>
  );
};
