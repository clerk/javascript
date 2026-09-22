import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { UserProfilePasswordRowView } from './user-profile-password-row.view';
import type { UserProfilePasswordSectionViewProps } from './user-profile-password-section.types';

export type {
  UserProfileEditPasswordField,
  UserProfileEditPasswordValue,
  UserProfilePasswordManagedBy,
  UserProfilePasswordSectionViewProps,
} from './user-profile-password-section.types';

export function UserProfilePasswordSectionView({
  sectionTitle,
  hasPassword = false,
  requiresCurrentPassword = false,
  managedBy,
  onSubmitPassword,
}: UserProfilePasswordSectionViewProps) {
  const m = useMessages('userProfilePasswordSection');
  const title = sectionTitle ?? m.sectionTitle;
  if (!hasPassword && !managedBy && !onSubmitPassword) {
    return null;
  }

  return (
    <Section.Root aria-label={title ? undefined : m.label}>
      {title ? <Section.Title>{title}</Section.Title> : null}
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
