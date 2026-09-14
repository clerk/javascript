import type { ReactNode } from 'react';

import { Section } from '../../components/section';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';

export interface UserProfileUsernameRowViewProps {
  username: string;
  action?: ReactNode;
}

export function UserProfileUsernameRowView({ username, action }: UserProfileUsernameRowViewProps) {
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.username.label}</Section.Label>
          <Section.Description>{username}</Section.Description>
        </Section.Content>
        {action ? <Section.Actions>{action}</Section.Actions> : null}
      </Section.Item>
    </Section.Row>
  );
}
