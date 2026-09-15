import { Section } from '../../../components/section';
import { UserProfilePasswordRowView } from './user-profile-password-row.view';
import { userProfilePasswordSectionBase as m } from './user-profile-password-section.messages';
import type { UserProfilePasswordSectionViewProps } from './user-profile-password-section.types';

export type {
  UserProfileEditPasswordField,
  UserProfileEditPasswordValue,
  UserProfilePasswordManagedBy,
  UserProfilePasswordSectionViewProps,
} from './user-profile-password-section.types';

export function UserProfilePasswordSectionView({
  sectionTitle = m.sectionTitle,
  hasPassword = false,
  requiresCurrentPassword = false,
  managedBy,
  onSubmitPassword,
}: UserProfilePasswordSectionViewProps) {
  if (!hasPassword && !managedBy && !onSubmitPassword) {
    return null;
  }

  return (
    <Section.Root aria-label={sectionTitle ? undefined : m.label}>
      {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
      <Section.Group>
        <UserProfilePasswordRowView
          hasPassword={hasPassword}
          requiresCurrentPassword={requiresCurrentPassword}
          managedBy={managedBy}
          onSubmitPassword={onSubmitPassword}
        />
      </Section.Group>
    </Section.Root>
  );
}
