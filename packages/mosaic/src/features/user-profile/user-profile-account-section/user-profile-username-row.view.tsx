import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { SaveResult } from '../../../utils/save-result';
import { useUserProfileEditUsernameController } from './user-profile-edit-username.controller';
import type { UserProfileEditUsernameField } from './user-profile-edit-username.dialog';
import { UserProfileEditUsernameDialog } from './user-profile-edit-username.dialog';

export interface UserProfileUsernameRowViewProps {
  username: string;
  onSubmit?: (username: string) => Promise<SaveResult<UserProfileEditUsernameField>>;
}

export function UserProfileUsernameRowView({ username, onSubmit }: UserProfileUsernameRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.username.label}</Section.Label>
          {username ? <Section.Description>{username}</Section.Description> : null}
        </Section.Content>
        {onSubmit ? (
          <Section.Actions>
            <EditUsername
              username={username}
              onSubmit={onSubmit}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}

function EditUsername({
  username,
  onSubmit,
}: {
  username: string;
  onSubmit: (username: string) => Promise<SaveResult<UserProfileEditUsernameField>>;
}) {
  const m = useMessages('userProfileAccountSection');
  const controller = useUserProfileEditUsernameController({ username, onSubmit });
  const isSet = Boolean(username);

  return (
    <UserProfileEditUsernameDialog
      {...controller}
      open={controller.isOpen}
      title={isSet ? m.username.dialogTitle : m.username.setDialogTitle}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {isSet ? m.username.edit : m.username.set}
        </Button>
      }
    />
  );
}
