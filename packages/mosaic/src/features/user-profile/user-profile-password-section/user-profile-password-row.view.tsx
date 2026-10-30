import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { UserProfileManagedByLabel } from '../user-profile-managed-by';
import { UserProfileSecurityIcon } from '../user-profile-security-icon';
import type { UserProfilePasswordSectionViewProps } from './user-profile-password-section.types';

export function UserProfilePasswordRowView({
  action,
  hasPassword = false,
  managedBy,
}: UserProfilePasswordSectionViewProps) {
  const m = useMessages('userProfile').password;
  return (
    <Section.Items>
      <Section.Item>
        <UserProfileSecurityIcon name='password' />
        <Section.Content>
          <Section.Description>{hasPassword ? m.masked : m.noPasswordSet}</Section.Description>
        </Section.Content>
        {action ? (
          <Section.Actions>{action}</Section.Actions>
        ) : managedBy ? (
          <UserProfileManagedByLabel
            managedBy={managedBy}
            label={fill(m.managedBy, { name: managedBy.name })}
          />
        ) : null}
      </Section.Item>
    </Section.Items>
  );
}
