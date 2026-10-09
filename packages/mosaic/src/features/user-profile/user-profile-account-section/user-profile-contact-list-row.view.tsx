import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';
import { useEffect, useRef } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Spinner } from '../../../components/spinner';
import { fill, useMessages } from '../../../localization';
import type { TransitionProps } from '../../../primitives/hooks';
import { useTransition } from '../../../primitives/hooks';
import { mergeRenderList } from '../../../primitives/hooks/use-presence-list';
import { truncationStyles } from '../../../styles/typography.styles';
import { styles as panelStyles } from '../user-profile-profile-panel.styles';
import { badgeShift, styles } from './user-profile-account-section.styles';

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
  /** The item whose set-primary request is in flight. */
  pendingId?: string;
  /** The item showing the pending indicator, once the request has outlasted the spin delay. */
  shownPendingId?: string;
  children?: ReactNode;
}

const byId = (item: { id: string }) => item.id;

function withoutEntrance(transitionProps: TransitionProps, appear: boolean) {
  return appear ? transitionProps : { ...transitionProps, 'data-starting-style': undefined, style: undefined };
}

function SlotItem({
  open,
  appear,
  children,
}: {
  open: boolean;
  appear: boolean;
  children: (ref: Ref<HTMLSpanElement>, props: TransitionProps) => ReactNode;
}) {
  const element = useRef<HTMLSpanElement>(null);
  const entrance = useRef<boolean | null>(null);
  const { mounted, transitionProps } = useTransition({ open, ref: element });
  if (mounted && entrance.current === null) {
    entrance.current = appear;
  }

  if (!mounted) {
    return null;
  }

  return children(element, withoutEntrance(transitionProps, entrance.current ?? appear));
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
  shownPendingId,
  addAction,
  rowRef,
  triggerRef,
  children,
}: UserProfileContactListRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const keys = items.map(byId);
  const previousKeys = useRef(keys);
  const primaryId = items.find(item => item.isDefault)?.id;
  const primaryMove = useRef({ id: primaryId, direction: 0 });
  if (primaryMove.current.id !== primaryId) {
    const order = mergeRenderList(previousKeys.current, keys);
    const from = primaryMove.current.id === undefined ? -1 : order.indexOf(primaryMove.current.id);
    const to = primaryId === undefined ? -1 : order.indexOf(primaryId);
    primaryMove.current = { id: primaryId, direction: from === -1 || to === -1 ? 0 : Math.sign(to - from) };
  }
  const settled = useRef(false);
  useEffect(() => {
    settled.current = true;
    previousKeys.current = keys;
  });
  const appear = settled.current;

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
        <Section.AnimatedItems
          items={items}
          getKey={byId}
          busy={item => pendingId === item.id || shownPendingId === item.id}
          empty={
            <Section.Content>
              <Section.Description>{m[kind].empty}</Section.Description>
            </Section.Content>
          }
        >
          {(item, { present }) => {
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
              <>
                <Section.Content>
                  <Section.Description xstyle={panelStyles.contactValue}>
                    <span {...stylex.props(truncationStyles.singleLine, panelStyles.contactText)}>{item.value}</span>
                    <span {...stylex.props(styles.badgeSlot)}>
                      <SlotItem
                        open={item.isDefault === true}
                        appear={appear}
                      >
                        {(ref, props) => (
                          <Badge
                            ref={ref}
                            color='neutral'
                            xstyle={[styles.badgeSlotItem, badgeShift.along(primaryMove.current.direction)]}
                            {...props}
                          >
                            {m.primary}
                          </Badge>
                        )}
                      </SlotItem>
                      <SlotItem
                        open={shownPendingId === item.id}
                        appear={appear}
                      >
                        {(ref, props) => (
                          <Spinner
                            ref={ref}
                            role='progressbar'
                            aria-hidden={undefined}
                            aria-label={m.settingPrimary}
                            size='sm'
                            xstyle={styles.badgeSlotItem}
                            {...props}
                          />
                        )}
                      </SlotItem>
                    </span>
                  </Section.Description>
                </Section.Content>
                {actions.length > 0 ? (
                  <Section.Actions>
                    <ActionMenu
                      triggerRef={present ? triggerRef?.(item.id) : undefined}
                      actions={actions}
                      label={fill(m.manageValue, { value: item.value })}
                    />
                  </Section.Actions>
                ) : null}
              </>
            );
          }}
        </Section.AnimatedItems>
        {children}
      </Section.Body>
    </Section.Group>
  );
}
