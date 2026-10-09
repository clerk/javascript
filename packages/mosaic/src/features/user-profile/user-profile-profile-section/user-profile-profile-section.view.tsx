import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { UserProfileNameRowView } from './user-profile-name-row.view';
import { UserProfilePictureRowView } from './user-profile-picture-row.view';
import type { UserProfileProfileSectionViewProps } from './user-profile-profile-section.types';
import { UserProfileUsernameRowView } from './user-profile-username-row.view';

export function UserProfileProfileSectionView({
  name,
  imageUrl,
  hasImage = false,
  showName,
  nameManagedBy,
  nameAction,
  showUsername,
  username,
  usernameAction,
  picture,
}: UserProfileProfileSectionViewProps) {
  const m = useMessages('userProfileProfileSection');

  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>{m.title}</Section.Title>
        </Section.Header>
        <Section.Body>
          <UserProfilePictureRowView
            {...picture}
            name={name}
            imageUrl={imageUrl}
            hasImage={hasImage}
          />
          {showName ? (
            <UserProfileNameRowView
              name={name}
              managedBy={nameManagedBy}
              action={nameAction}
            />
          ) : null}
          {showUsername ? (
            <UserProfileUsernameRowView
              username={username}
              action={usernameAction}
            />
          ) : null}
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
