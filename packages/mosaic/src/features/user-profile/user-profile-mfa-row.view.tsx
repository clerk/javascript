import { Badge } from '../../components/badge';
import { Section } from '../../components/section';
import { fill } from '../../utils/messages';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { userProfileMfaMessages as m } from './user-profile-mfa-section.messages';
import { styles } from './user-profile-mfa-section.styles';
import type { UserProfileMfaMethod, UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';
import { UserProfileSecurityIcon } from './user-profile-security-icon';

export function UserProfileMfaRowView({
  method,
  onRemove,
  onSetDefault,
  onRegenerateBackupCodes,
}: Pick<UserProfileMfaSectionViewProps, 'onSetDefault' | 'onRegenerateBackupCodes'> & {
  method: UserProfileMfaMethod;
  onRemove?: () => void;
}) {
  const label = method.label ?? m.methods[method.type];
  const manageLabel =
    method.type === 'sms' && method.description
      ? fill(m.manageSms, { label, phoneNumber: method.description })
      : fill(m.manage, { label });
  const actions: UserProfileMenuAction[] = [];

  if (method.type === 'sms' && method.canSetDefault && onSetDefault) {
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
        <Section.Label xstyle={styles.label}>
          {label}
          {method.isDefault ? <Badge color='neutral'>{m.default}</Badge> : null}
        </Section.Label>
        {method.description ? <Section.Description>{method.description}</Section.Description> : null}
      </Section.Content>
      {actions.length > 0 ? (
        <Section.Actions>
          <UserProfileActionMenu
            actions={actions}
            label={manageLabel}
          />
        </Section.Actions>
      ) : null}
    </Section.Item>
  );
}
