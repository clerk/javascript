import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { UserProfileManagedByLabel } from '../user-profile-managed-by';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from './user-profile-edit-password.dialog';
import type {
  UserProfileEditPasswordValue,
  UserProfilePasswordSectionViewProps,
} from './user-profile-password-section.types';

export function UserProfilePasswordRowView({
  hasPassword = false,
  requiresCurrentPassword = false,
  managedBy,
  onSubmitPassword,
}: Omit<UserProfilePasswordSectionViewProps, 'sectionTitle'>) {
  const m = useMessages('userProfilePasswordSection');
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.label}</Section.Label>
          <Section.Description>{hasPassword ? m.masked : m.noPasswordSet}</Section.Description>
        </Section.Content>
        {managedBy ? (
          <UserProfileManagedByLabel iconUrl={managedBy.iconUrl}>
            {fill(m.managedBy, { name: managedBy.name })}
          </UserProfileManagedByLabel>
        ) : onSubmitPassword ? (
          <Section.Actions>
            <EditPassword
              hasPassword={hasPassword}
              requiresCurrentPassword={requiresCurrentPassword}
              onSubmit={onSubmitPassword}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}

function EditPassword({
  hasPassword,
  requiresCurrentPassword,
  onSubmit,
}: {
  hasPassword: boolean;
  requiresCurrentPassword: boolean;
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<void>;
}) {
  const m = useMessages('userProfilePasswordSection');
  const controller = useUserProfileEditPasswordController({
    requiresCurrentPassword: hasPassword && requiresCurrentPassword,
    onSubmit,
  });

  return (
    <UserProfileEditPasswordDialog
      form={controller.form}
      hasPassword={hasPassword}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
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
