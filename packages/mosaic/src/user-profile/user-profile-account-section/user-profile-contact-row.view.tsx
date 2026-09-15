import type { ReactNode } from 'react';

import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Section } from '../../components/section';
import { styles } from '../user-profile-profile-panel.styles';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';

export interface UserProfileContactRowViewProps {
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean }>;
  onAdd?: () => void;
  onManage?: (id: string) => void;
  addAction?: ReactNode;
}

export function UserProfileContactRowView({
  kind,
  label,
  items,
  onAdd,
  onManage,
  addAction,
}: UserProfileContactRowViewProps) {
  const item = items[0];
  const onClick = item ? (onManage ? () => onManage(item.id) : undefined) : onAdd;
  const emptyDescription = m[kind].empty;
  const actionLabel = item ? m[kind].update : m[kind].add;

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
          {item ? (
            <Section.Description xstyle={styles.contactValue}>
              <span>{item.value}</span>
              {item.isDefault ? <Badge color='neutral'>{m.primary}</Badge> : null}
            </Section.Description>
          ) : (
            <Section.Description>{emptyDescription}</Section.Description>
          )}
        </Section.Content>
        {!item && addAction ? (
          <Section.Actions>{addAction}</Section.Actions>
        ) : onClick ? (
          <Section.Actions>
            <Button
              color='neutral'
              size='sm'
              variant='outline'
              onClick={onClick}
            >
              {actionLabel}
            </Button>
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}
