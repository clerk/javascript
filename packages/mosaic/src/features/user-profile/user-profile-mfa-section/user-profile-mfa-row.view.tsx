import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import type { Ref } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Section } from '../../../components/section';
import { fill, type MosaicMessages, useMessages } from '../../../localization';
import { UserProfileSecurityIcon } from '../user-profile-security-icon';
import type { UserProfileMfaMethod, UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

function menuActions({
  method,
  onRemove,
  onSetDefault,
  onRegenerateBackupCodes,
  showDisabledMenu,
  m,
}: {
  method: UserProfileMfaMethod;
  onRemove?: () => void;
  onSetDefault?: (id: string) => void;
  onRegenerateBackupCodes?: () => void;
  showDisabledMenu?: boolean;
  m: MosaicMessages['userProfileMfa'];
}): ActionMenuAction[] {
  const actions: ActionMenuAction[] = [];
  if (method.type === 'sms' && method.canSetDefault && !method.isDefault && onSetDefault) {
    actions.push({ label: m.setDefault, onClick: () => onSetDefault(method.id) });
  }
  if (method.type === 'backup-codes') {
    if (onRegenerateBackupCodes) {
      actions.push({ label: m.regenerate, onClick: onRegenerateBackupCodes });
    }
  } else if (onRemove && method.canRemove !== false) {
    actions.push({ label: m.remove, color: 'negative', onClick: onRemove });
  }
  if (showDisabledMenu && actions.length === 0) {
    if (method.type === 'sms' && method.canSetDefault && !method.isDefault) {
      actions.push({ label: m.setDefault, disabled: true });
    }
    if (method.type === 'backup-codes') {
      actions.push({ label: m.regenerate, disabled: true });
    } else if (method.canRemove !== false) {
      actions.push({ label: m.remove, color: 'negative', disabled: true });
    }
  }
  return actions;
}

export function UserProfileMfaRowView({
  method,
  triggerRef,
  onRemove,
  onSetDefault,
  onRegenerateBackupCodes,
  showDisabledMenu,
}: Pick<UserProfileMfaSectionViewProps, 'onRegenerateBackupCodes'> & {
  method: UserProfileMfaMethod;
  triggerRef?: Ref<HTMLButtonElement>;
  onRemove?: () => void;
  onSetDefault?: (id: string) => void;
  showDisabledMenu?: boolean;
}) {
  const m = useMessages('userProfileMfa');
  const label = method.label ?? m.methods[method.type];
  const description =
    method.type === 'sms' && method.description ? stringToFormattedPhoneString(method.description) : method.description;
  const manageLabel =
    method.type === 'sms' && description
      ? fill(m.manageSms, { label, phoneNumber: description })
      : fill(m.manage, { label });
  const actions = menuActions({ method, onRemove, onSetDefault, onRegenerateBackupCodes, showDisabledMenu, m });

  return (
    <Section.Item>
      <UserProfileSecurityIcon name={method.type} />
      <Section.Content>
        <Section.Label>
          {label}
          {method.isDefault ? <Badge color='neutral'>{m.default}</Badge> : null}
        </Section.Label>
        {description ? <Section.Description>{description}</Section.Description> : null}
      </Section.Content>
      {actions.length > 0 ? (
        <Section.Actions>
          <ActionMenu
            triggerRef={triggerRef}
            actions={actions}
            label={manageLabel}
          />
        </Section.Actions>
      ) : null}
    </Section.Item>
  );
}
