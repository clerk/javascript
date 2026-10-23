import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';

import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import type { MosaicMessages } from '../../localization';
import { fill, useMessages } from '../../localization';
import { truncationStyles } from '../../styles/typography.styles';
import type { UserProfileContact } from './user-profile-contact.types';
import type { UserProfileContactAccess } from './user-profile-contact.utils';
import { styles } from './user-profile-profile-panel.styles';

export interface UserProfileContactListRowViewProps {
  rowRef?: Ref<HTMLDivElement>;
  triggerRef?: (id: string) => Ref<HTMLButtonElement>;
  addAction?: ReactNode;
  kind: 'email' | 'phone';
  label: string;
  items: UserProfileContact[];
  canManage?: (id: string) => boolean;
  eligibility?: Pick<UserProfileContactAccess, 'canRemove'>;
  onAdd?: () => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  pendingPrimaryId?: string;
  pendingVerifyId?: string;
  verificationReadyId?: string;
  primaryChallengeVisible?: boolean;
  onRemove?: (item: UserProfileContact) => void;
  children?: ReactNode;
}

export function UserProfileContactListRowView({
  kind,
  label,
  items,
  canManage,
  eligibility,
  onAdd,
  onVerify,
  onSetPrimary,
  pendingPrimaryId,
  pendingVerifyId,
  verificationReadyId,
  primaryChallengeVisible,
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
              const actions = toContactActions(item, m, {
                kind,
                canManage,
                eligibility,
                onVerify,
                onSetPrimary,
                pendingPrimaryId,
                pendingVerifyId,
                verificationReadyId,
                primaryChallengeVisible,
                onRemove,
              });

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
                        disabled={
                          (pendingPrimaryId ?? pendingVerifyId) !== undefined &&
                          (pendingPrimaryId ?? pendingVerifyId) !== item.id
                        }
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

function toContactActions(
  item: UserProfileContact,
  m: MosaicMessages['userProfileContact'],
  {
    kind,
    canManage,
    eligibility,
    onVerify,
    onSetPrimary,
    pendingPrimaryId,
    pendingVerifyId,
    verificationReadyId,
    primaryChallengeVisible,
    onRemove,
  }: Pick<
    UserProfileContactListRowViewProps,
    | 'kind'
    | 'canManage'
    | 'eligibility'
    | 'onVerify'
    | 'onSetPrimary'
    | 'onRemove'
    | 'verificationReadyId'
    | 'pendingVerifyId'
    | 'pendingPrimaryId'
    | 'primaryChallengeVisible'
  >,
): ActionMenuAction[] {
  const actions: ActionMenuAction[] = [];
  const canManageItem = canManage?.(item.id) !== false;
  const verificationAction: ActionMenuAction | undefined =
    pendingPrimaryId === item.id && onSetPrimary
      ? {
          label: m.setPrimary,
          onClick: () => onSetPrimary(item.id),
          progress: primaryChallengeVisible ? 'handoff' : 'pending',
        }
      : toContactVerificationAction(item, m, {
          kind,
          canManage,
          eligibility,
          onVerify,
          pendingVerifyId,
          verificationReadyId,
          onSetPrimary,
        });
  if (verificationAction) {
    actions.push(verificationAction);
  }

  if (eligibility?.canRemove || (eligibility === undefined && canManageItem && onRemove)) {
    actions.push(
      canManageItem && onRemove
        ? { label: m[kind].remove, color: 'negative', onClick: () => onRemove(item) }
        : { label: m[kind].remove, color: 'negative', disabled: true },
    );
  }
  return actions;
}

function toContactVerificationAction(
  item: UserProfileContact,
  m: MosaicMessages['userProfileContact'],
  {
    kind,
    canManage,
    eligibility,
    onVerify,
    onSetPrimary,
    pendingVerifyId,
    verificationReadyId,
  }: Pick<
    UserProfileContactListRowViewProps,
    'kind' | 'canManage' | 'eligibility' | 'onVerify' | 'onSetPrimary' | 'pendingVerifyId' | 'verificationReadyId'
  >,
): ActionMenuAction | undefined {
  if (item.isVerified && item.isDefault) {
    return undefined;
  }
  const action = item.isVerified ? onSetPrimary : onVerify;
  const enabledAction = canManage?.(item.id) !== false && action;
  if (!eligibility && !enabledAction) {
    return undefined;
  }
  const label = item.isVerified ? m.setPrimary : item.isDefault ? m.completeVerification : m[kind].verify;
  const progress = verificationReadyId === item.id ? 'handoff' : pendingVerifyId === item.id ? 'pending' : 'idle';
  return enabledAction ? { label, onClick: () => enabledAction(item.id), progress } : { label, disabled: true };
}
