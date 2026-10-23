import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import type { Ref } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { UserProfileSecurityIcon } from '../user-profile-security-icon';
import type { UserProfileMfaMethod, UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

export function UserProfileMfaRowView({
  method,
  triggerRef,
  onRemove,
  onSetDefault,
  onRegenerateBackupCodes,
}: Pick<UserProfileMfaSectionViewProps, 'onRegenerateBackupCodes'> & {
  method: UserProfileMfaMethod;
  triggerRef?: Ref<HTMLButtonElement>;
  onRemove?: () => void;
  onSetDefault?: (id: string) => void;
}) {
  const m = useMessages('userProfileMfa');
  const label = method.label ?? m.methods[method.type];
  const description =
    method.type === 'sms' && method.description ? stringToFormattedPhoneString(method.description) : method.description;
  const manageLabel =
    method.type === 'sms' && description
      ? fill(m.manageSms, { label, phoneNumber: description })
      : fill(m.manage, { label });
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
