import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Text } from '../../../components/text';
import { fill } from '../user-profile-account-section/user-profile-account-section.messages';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import type { UserProfileEditPasswordValue } from './user-profile-edit-password.view';
import { UserProfileEditPasswordView } from './user-profile-edit-password.view';
import { userProfilePasswordSectionBase as m } from './user-profile-password-section.messages';
import { styles } from './user-profile-password-section.styles';

export type { UserProfileEditPasswordField, UserProfileEditPasswordValue } from './user-profile-edit-password.view';

/** The enterprise connection that owns the password, shown in place of the edit action. */
export interface UserProfilePasswordManagedBy {
  /** The connection's display name, e.g. `'Okta'`. Rendered as "Managed by {name}". */
  name: string;
  /** The connection's logo. A generic lock stands in when absent (a custom IDP with no icon). */
  iconUrl?: string;
}

export interface UserProfilePasswordSectionViewProps {
  sectionTitle?: string;
  /** Whether the user has a password. Decides between replacing one and setting the first. */
  hasPassword?: boolean;
  /** Whether the save must carry the password being replaced. Off when reverification stands in for it. */
  requiresCurrentPassword?: boolean;
  /**
   * Supplied from `user.enterpriseAccounts`. When set, the connection owns the password: the row
   * shows "Managed by {name}" in place of the edit action and never opens the dialog.
   */
  managedBy?: UserProfilePasswordManagedBy;
  /** Resolve to close the dialog; reject with an `Error` to keep it open showing why. */
  onSubmitPassword?: (value: UserProfileEditPasswordValue) => Promise<void>;
}

export function UserProfilePasswordSectionView({
  sectionTitle = m.sectionTitle,
  hasPassword = false,
  requiresCurrentPassword = false,
  managedBy,
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
      </Section.Group>
    </Section.Root>
  );
}

function ManagedByLabel({ name, iconUrl }: UserProfilePasswordManagedBy) {
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
        {...stylex.props(styles.managedByText)}
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
  const controller = useUserProfileEditPasswordController({
    requiresCurrentPassword: hasPassword && requiresCurrentPassword,
    onSubmit,
  });

  return (
    <UserProfileEditPasswordView
      {...controller}
      hasPassword={hasPassword}
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
