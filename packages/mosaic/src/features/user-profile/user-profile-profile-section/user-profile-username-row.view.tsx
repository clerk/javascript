import type { ReactNode } from 'react';

import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';

export interface UserProfileUsernameRowViewProps {
  username: string;
  action?: ReactNode;
}

export function UserProfileUsernameRowView({ username, action }: UserProfileUsernameRowViewProps) {
  const m = useMessages('userProfileProfileSection');

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.username.label}</Section.Label>
          <Section.Description>{username || m.username.empty}</Section.Description>
        </Section.Content>
        {action ? <Section.Actions>{action}</Section.Actions> : null}
      </Section.Item>
    </Section.Row>
  );
}
