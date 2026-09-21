import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { UserProfileSaveResult } from './user-profile-account-section.types';
import { useUserProfileEditUsernameController } from './user-profile-edit-username.controller';
import type { UserProfileEditUsernameField } from './user-profile-edit-username.dialog';
import { UserProfileEditUsernameDialog } from './user-profile-edit-username.dialog';

export interface UserProfileUsernameRowViewProps {
  username: string;
  onSubmit?: (username: string) => Promise<UserProfileSaveResult<UserProfileEditUsernameField>>;
}

export function UserProfileUsernameRowView({ username, onSubmit }: UserProfileUsernameRowViewProps) {
  const m = useMessages('userProfileAccountSection');
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

function EditUsername({
  username,
  onSubmit,
}: {
  username: string;
  onSubmit: (username: string) => Promise<UserProfileSaveResult<UserProfileEditUsernameField>>;
}) {
  const m = useMessages('userProfileAccountSection');
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
