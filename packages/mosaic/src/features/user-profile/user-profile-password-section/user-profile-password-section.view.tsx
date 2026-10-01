import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { UserProfilePasswordRowView } from './user-profile-password-row.view';
import type { UserProfilePasswordSectionViewProps } from './user-profile-password-section.types';

export type {
  UserProfileEditPasswordField,
  UserProfileEditPasswordValue,
  UserProfileEditPasswordValues,
  UserProfilePasswordManagedBy,
  UserProfilePasswordSectionViewProps,
} from './user-profile-password-section.types';

export function UserProfilePasswordSectionView({
  action,
  hasPassword = false,
  managedBy,
}: UserProfilePasswordSectionViewProps) {
  const m = useMessages('userProfilePasswordSection');
  if (!hasPassword && !managedBy && !action) {
    return null;
  }

  return (
    <Section.Group>
      <Section.Header>
        <Section.Title>{m.label}</Section.Title>
      </Section.Header>
      <Section.Body>
        <UserProfilePasswordRowView
          action={action}
          hasPassword={hasPassword}
          managedBy={managedBy}
        />
      </Section.Body>
    </Section.Group>
  );
}
