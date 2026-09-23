import type { ReactNode } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { styles } from '../user-profile-profile-panel.styles';

export interface UserProfileContactListRowViewProps {
  addAction?: ReactNode;
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean; isVerified?: boolean; canRemove?: boolean }>;
  onAdd?: () => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UserProfileContactListRowView({
  kind,
  label,
  items,
  onAdd,
  onVerify,
  onSetPrimary,
  onRemove,
  addAction,
}: UserProfileContactListRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const emptyDescription = m[kind].empty;

  return (
    <Section.Row>
      <Section.Header>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
        </Section.Content>
        {addAction ? (
          <Section.Actions>{addAction}</Section.Actions>
        ) : onAdd ? (
          <Section.Actions>
            <Button
              aria-label={m[kind].add}
              color='neutral'
              size='sm'
              variant='outline'
              onClick={onAdd}
            >
              <Icon
                name='plus'
                placement='inline-start'
                size='sm'
              />
              {m.add}
            </Button>
          </Section.Actions>
        ) : null}
      </Section.Header>
      <Section.Items>
        {items.length === 0 ? (
          <Section.Item>
            <Section.Content>
              <Section.Description>{emptyDescription}</Section.Description>
            </Section.Content>
          </Section.Item>
        ) : (
          items.map(item => {
            const actions: ActionMenuAction[] = [];

            if (item.isVerified === false && onVerify) {
              actions.push({
                label: item.isDefault ? m.completeVerification : m[kind].verify,
                onClick: () => onVerify(item.id),
              });
            } else if (!item.isDefault && item.isVerified === true && onSetPrimary) {
              actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(item.id) });
            }

            if (onRemove && item.canRemove !== false) {
              actions.push({
                label: m[kind].remove,
                color: 'negative',
                onClick: () => onRemove(item.id),
              });
            }

            return (
              <Section.Item key={item.id}>
                <Section.Content>
                  <Section.Description xstyle={styles.contactValue}>
                    <span>{item.value}</span>
                    {item.isDefault ? <Badge color='neutral'>{m.primary}</Badge> : null}
                  </Section.Description>
                </Section.Content>
                {actions.length > 0 ? (
                  <Section.Actions>
                    <ActionMenu
                      actions={actions}
                      label={fill(m.manageValue, { value: item.value })}
                    />
                  </Section.Actions>
                ) : null}
              </Section.Item>
            );
          })
        )}
      </Section.Items>
    </Section.Row>
  );
}
