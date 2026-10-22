import type { ReactNode } from 'react';

import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { UserProfileManagedBy } from '../user-profile-managed-by';
import { UserProfileManagedByLabel } from '../user-profile-managed-by';

export interface UserProfileNameRowViewProps {
  name: string;
  managedBy?: UserProfileManagedBy;
  action?: ReactNode;
}

export function UserProfileNameRowView({ name, managedBy, action }: UserProfileNameRowViewProps) {
  const m = useMessages('userProfileProfileSection');

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.name.label}</Section.Label>
          <Section.Description>{name || m.name.empty}</Section.Description>
        </Section.Content>
        {action ? (
          <Section.Actions>{action}</Section.Actions>
        ) : managedBy ? (
          <UserProfileManagedByLabel
            managedBy={managedBy}
            template={m.name.managedBy}
          />
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}
