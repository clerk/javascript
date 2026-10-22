import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { UserProfileManagedByLabel } from '../user-profile-managed-by';
import type { UserProfilePasswordSectionViewProps } from './user-profile-password-section.types';

export function UserProfilePasswordRowView({
  action,
  hasPassword = false,
  managedBy,
}: UserProfilePasswordSectionViewProps) {
  const m = useMessages('userProfilePasswordSection');
  return (
    <Section.Items>
      <Section.Item>
        <Section.Content>
          <Section.Description>{hasPassword ? m.masked : m.noPasswordSet}</Section.Description>
        </Section.Content>
        {action ? (
          <Section.Actions>{action}</Section.Actions>
        ) : managedBy ? (
          <UserProfileManagedByLabel
            managedBy={managedBy}
            template={m.managedBy}
          />
        ) : null}
      </Section.Item>
    </Section.Items>
  );
}
