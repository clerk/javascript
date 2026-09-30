import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';
import { useEffect, useRef } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { usePresenceList, useReorderKeys, useTransition } from '../../../primitives/hooks';
import { styles as panelStyles } from '../user-profile-profile-panel.styles';
import { contactItemMarker } from './user-profile-account-section.markers.stylex';
import { contactIndex, styles } from './user-profile-account-section.styles';

export interface UserProfileContactListRowViewProps {
  rowRef?: Ref<HTMLDivElement>;
  triggerRef?: (id: string) => Ref<HTMLButtonElement>;
  addAction?: ReactNode;
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean; isVerified?: boolean; canRemove?: boolean }>;
  onAdd?: () => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** The item whose set-primary request is in flight; it announces busy. */
  pendingId?: string;
  /** Pulses every row in a wave, for a request that has outlasted a short delay. */
  pulsing?: boolean;
}

export function primaryFirst<T extends { isDefault?: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(b.isDefault ?? false) - Number(a.isDefault ?? false));
}

const byId = (item: { id: string }) => item.id;
const byKey = (entry: { key: string }) => entry.key;
const isPrimary = (item: { isDefault?: boolean }) => item.isDefault === true;

function ContactListItem({
  present = true,
  appear = true,
  pending = false,
  onExited,
  children,
}: {
  present?: boolean;
  appear?: boolean;
  pending?: boolean;
  onExited?: () => void;
  children: ReactNode;
}) {
  const element = useRef<HTMLDivElement>(null);
  const { mounted, transitionProps } = useTransition({ open: present, ref: element });

  useEffect(() => {
    if (!mounted) {
      onExited?.();
    }
  }, [mounted, onExited]);
  useEffect(() => () => onExited?.(), [onExited]);

  if (!mounted) {
    return null;
  }

  const stateProps = { ...transitionProps, style: undefined };

  return (
    <div
      ref={element}
      aria-hidden={present ? undefined : true}
      {...stylex.props(styles.contactSlot, appear && styles.contactSlotAppear)}
      {...stateProps}
      {...inertProps(!present)}
    >
      <div
        {...stylex.props(styles.contactClip)}
        {...transitionProps}
      >
        <Section.Item
          aria-busy={pending || undefined}
          data-pending={pending ? '' : undefined}
          xstyle={[styles.contactItem, contactItemMarker]}
          {...transitionProps}
        >
          {children}
        </Section.Item>
      </div>
    </div>
  );
}

export function UserProfileContactListRowView({
  kind,
  label,
  items,
  onAdd,
  onVerify,
  onSetPrimary,
  onRemove,
  pendingId,
  pulsing = false,
  addAction,
  rowRef,
  triggerRef,
}: UserProfileContactListRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const emptyDescription = m[kind].empty;
  const entries = usePresenceList(useReorderKeys(items, byId, isPrimary), byKey);
  const settled = useRef(false);
  useEffect(() => {
    settled.current = true;
  }, []);

  return (
    <Section.Row
      ref={rowRef}
      role='group'
      tabIndex={-1}
      aria-label={label}
    >
      <Section.Item>
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
      </Section.Item>
      <Section.Items>
        {entries.map(({ key, item: { item }, present, onExited }, index) => {
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
            <ContactListItem
              key={key}
              present={present}
              appear={settled.current}
              pending={pendingId === item.id}
              onExited={onExited}
            >
              <Section.Content
                xstyle={[styles.contactFade, pulsing && [styles.contactPending, contactIndex.at(index)]]}
              >
                <Section.Description xstyle={panelStyles.contactValue}>
                  <span>{item.value}</span>
                  {item.isDefault ? <Badge color='neutral'>{m.primary}</Badge> : null}
                </Section.Description>
              </Section.Content>
              {actions.length > 0 ? (
                <Section.Actions xstyle={styles.contactFade}>
                  <ActionMenu
                    triggerRef={present ? triggerRef?.(item.id) : undefined}
                    actions={actions}
                    label={fill(m.manageValue, { value: item.value })}
                  />
                </Section.Actions>
              ) : null}
            </ContactListItem>
          );
        })}
        {items.length === 0 ? (
          <ContactListItem appear={settled.current}>
            <Section.Content xstyle={styles.contactFade}>
              <Section.Description>{emptyDescription}</Section.Description>
            </Section.Content>
          </ContactListItem>
        ) : null}
      </Section.Items>
    </Section.Row>
  );
}
