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
  asGroup = false,
  hasPassword = false,
  requiresCurrentPassword = false,
  managedBy,
  onSubmitPassword,
}: UserProfilePasswordSectionViewProps) {
  const m = useMessages('userProfilePasswordSection');
  if (!hasPassword && !managedBy && !onSubmitPassword) {
    return null;
  }

  const group = (
    <Section.Group
      variant={asGroup ? 'contained' : 'default'}
      aria-label={asGroup ? m.label : undefined}
    >
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

  return asGroup ? group : <Section.Root aria-label={m.label}>{group}</Section.Root>;
}
