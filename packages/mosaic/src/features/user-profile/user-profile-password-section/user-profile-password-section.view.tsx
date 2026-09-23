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
  asGroup = false,
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

  const group = (
    <Section.Group aria-label={asGroup && !title ? m.label : undefined}>
      {title ? <Section.Title>{title}</Section.Title> : null}
      <Section.Surface>
        <UserProfilePasswordRowView
          hasPassword={hasPassword}
          requiresCurrentPassword={requiresCurrentPassword}
          managedBy={managedBy}
          onSubmitPassword={onSubmitPassword}
        />
      </Section.Surface>
    </Section.Group>
  );

  return asGroup ? group : <Section.Root aria-label={title ? undefined : m.label}>{group}</Section.Root>;
}
