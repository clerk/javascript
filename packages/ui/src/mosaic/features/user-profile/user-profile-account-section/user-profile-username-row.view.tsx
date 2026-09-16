import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import { useUserProfileEditUsernameController } from './user-profile-edit-username.controller';
import { UserProfileEditUsernameDialog } from './user-profile-edit-username.dialog';

export interface UserProfileUsernameRowViewProps {
  username: string;
  onSubmit?: (username: string) => Promise<void>;
}

export function UserProfileUsernameRowView({ username, onSubmit }: UserProfileUsernameRowViewProps) {
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.username.label}</Section.Label>
          <Section.Description>{username}</Section.Description>
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
  const controller = useUserProfileEditUsernameController({ username, onSubmit });

  return (
    <UserProfileEditUsernameDialog
      {...controller}
      open={controller.isOpen}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {m.username.edit}
        </Button>
      }
    />
  );
}
