import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from './user-profile-edit-password.dialog';
import { styles } from './user-profile-password-section.styles';
import type {
  UserProfileEditPasswordValue,
  UserProfilePasswordManagedBy,
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
          <Section.Actions>
            <ManagedByLabel {...managedBy} />
          </Section.Actions>
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

function ManagedByLabel({ name, iconUrl }: UserProfilePasswordManagedBy) {
  const m = useMessages('userProfilePasswordSection');
  return (
    <div {...stylex.props(styles.managedBy)}>
      {iconUrl ? (
        <img
          alt=''
          src={iconUrl}
          {...stylex.props(styles.managedByIcon)}
        />
      ) : (
        <Icon
          aria-hidden
          name='security-lock'
          size='sm'
          xstyle={styles.managedByText}
        />
      )}
      <Text
        render={<span />}
        size='sm'
        xstyle={styles.managedByText}
      >
        {fill(m.managedBy, { name })}
      </Text>
    </div>
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
