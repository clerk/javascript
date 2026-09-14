import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import type { UserProfileEditPasswordValue } from './user-profile-edit-password.view';
import { UserProfileEditPasswordView } from './user-profile-edit-password.view';
import { userProfilePasswordSectionBase as m } from './user-profile-password-section.messages';

export type { UserProfileEditPasswordField, UserProfileEditPasswordValue } from './user-profile-edit-password.view';

export interface UserProfilePasswordSectionViewProps {
  sectionTitle?: string;
  /** Whether the user has a password. Decides between replacing one and setting the first. */
  hasPassword?: boolean;
  /** Whether the save must carry the password being replaced. Off when reverification stands in for it. */
  requiresCurrentPassword?: boolean;
  /** The account signs in only through an enterprise connection, so the password cannot change. */
  isReadOnly?: boolean;
  /** Resolve to close the dialog; reject with an `Error` to keep it open showing why. */
  onSubmitPassword?: (value: UserProfileEditPasswordValue) => Promise<void>;
}

export function UserProfilePasswordSectionView({
  sectionTitle = m.sectionTitle,
  hasPassword = false,
  requiresCurrentPassword = false,
  isReadOnly = false,
  onSubmitPassword,
}: UserProfilePasswordSectionViewProps) {
  return (
    <Section.Root aria-label={sectionTitle ? undefined : m.label}>
      {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{m.label}</Section.Label>
              {hasPassword ? <Section.Description>{m.masked}</Section.Description> : null}
            </Section.Content>
            {onSubmitPassword ? (
              <Section.Actions>
                <EditPassword
                  hasPassword={hasPassword}
                  isReadOnly={isReadOnly}
                  requiresCurrentPassword={requiresCurrentPassword}
                  onSubmit={onSubmitPassword}
                />
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

function EditPassword({
  hasPassword,
  requiresCurrentPassword,
  isReadOnly,
  onSubmit,
}: {
  hasPassword: boolean;
  requiresCurrentPassword: boolean;
  isReadOnly: boolean;
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<void>;
}) {
  const controller = useUserProfileEditPasswordController({
    requiresCurrentPassword: hasPassword && requiresCurrentPassword,
    onSubmit,
  });

  return (
    <UserProfileEditPasswordView
      {...controller}
      hasPassword={hasPassword}
      isReadOnly={isReadOnly}
      open={controller.isOpen}
      requiresCurrentPassword={requiresCurrentPassword}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {hasPassword ? m.change : m.set}
        </Button>
      }
    />
  );
}
