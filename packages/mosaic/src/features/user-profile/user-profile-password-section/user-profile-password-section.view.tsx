import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { UserProfilePasswordRowView } from './user-profile-password-row.view';
import type { UserProfilePasswordSectionViewProps } from './user-profile-password-section.types';

export type { UserProfileManagedBy } from '../user-profile-managed-by';
export type {
  UserProfileEditPasswordField,
  UserProfileEditPasswordValue,
  UserProfileEditPasswordValues,
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
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.label}</Section.Title>
          </Section.Content>
        </Section.Header>
        <Section.Body>
          <UserProfilePasswordRowView
            action={action}
            hasPassword={hasPassword}
            managedBy={managedBy}
          />
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
