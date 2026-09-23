import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { useUserProfileEditUsernameController } from './user-profile-edit-username.controller';
import { UserProfileEditUsernameDialog } from './user-profile-edit-username.dialog';

export interface UserProfileUsernameRowViewProps {
  username: string;
  onSubmit?: (username: string) => Promise<void>;
}

export function UserProfileUsernameRowView({ username, onSubmit }: UserProfileUsernameRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.username.label}</Section.Label>
          <Section.Description>{username || m.username.empty}</Section.Description>
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

function EditUsername({ username, onSubmit }: { username: string; onSubmit: (username: string) => Promise<void> }) {
  const m = useMessages('userProfileAccountSection');
  const controller = useUserProfileEditUsernameController({ username, onSubmit });
  const isSet = Boolean(username);

  return (
    <UserProfileEditUsernameDialog
      {...controller}
      open={controller.isOpen}
      title={isSet ? m.username.dialogTitle : m.username.addDialogTitle}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {isSet ? m.username.edit : m.username.add}
        </Button>
      }
    />
  );
}
