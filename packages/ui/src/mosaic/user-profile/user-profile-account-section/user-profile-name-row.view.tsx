import type { ReactNode } from 'react';

import { Section } from '../../components/section';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';

export interface UserProfileNameRowViewProps {
  name: string;
  action?: ReactNode;
}

export function UserProfileNameRowView({ name, action }: UserProfileNameRowViewProps) {
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.name.label}</Section.Label>
          <Section.Description>{name}</Section.Description>
        </Section.Content>
        {action ? <Section.Actions>{action}</Section.Actions> : null}
      </Section.Item>
    </Section.Row>
  );
}
