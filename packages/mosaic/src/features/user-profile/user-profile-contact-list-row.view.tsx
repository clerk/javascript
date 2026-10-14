import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';

import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { fill, useMessages } from '../../localization';
import { truncationStyles } from '../../styles/typography.styles';
import type { UserProfileContact } from './user-profile-contact.types';
import { styles } from './user-profile-profile-panel.styles';

export interface UserProfileContactListRowViewProps {
  rowRef?: Ref<HTMLDivElement>;
  triggerRef?: (id: string) => Ref<HTMLButtonElement>;
  addAction?: ReactNode;
  kind: 'email' | 'phone';
  label: string;
  items: UserProfileContact[];
  onAdd?: () => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (item: UserProfileContact) => void;
  children?: ReactNode;
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
  rowRef,
  triggerRef,
  children,
}: UserProfileContactListRowViewProps) {
  const m = useMessages('userProfileContact');
  const emptyDescription = m[kind].empty;

  return (
    <Section.Group
      ref={rowRef}
      tabIndex={-1}
    >
      <Section.Header>
        <Section.Content>
          <Section.Title>{label}</Section.Title>
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
      <Section.Body>
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

              if (!item.isVerified && onVerify) {
                actions.push({
                  label: item.isDefault ? m.completeVerification : m[kind].verify,
                  onClick: () => onVerify(item.id),
                });
              } else if (item.isVerified && !item.isDefault && onSetPrimary) {
                actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(item.id) });
              }

              if (onRemove) {
                actions.push({
                  label: m[kind].remove,
                  color: 'negative',
                  onClick: () => onRemove(item),
                });
              }

              return (
                <Section.Item key={item.id}>
                  <Section.Content>
                    <Section.Description xstyle={styles.contactValue}>
                      <span {...stylex.props(truncationStyles.singleLine, styles.contactText)}>{item.value}</span>
                      {item.isDefault ? <Badge color='neutral'>{m.primary}</Badge> : null}
                      {item.isVerified ? null : <Badge color='warning'>{m.unverified}</Badge>}
                    </Section.Description>
                  </Section.Content>
                  {actions.length > 0 ? (
                    <Section.Actions>
                      <ActionMenu
                        triggerRef={triggerRef?.(item.id)}
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
        {children}
      </Section.Body>
    </Section.Group>
  );
}
