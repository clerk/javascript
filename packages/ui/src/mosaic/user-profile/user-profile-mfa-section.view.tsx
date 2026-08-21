import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Menu } from '../components/menu';
import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { UserProfileSecurityIcon } from './user-profile-security-icon';
import { UserProfileSecurityList } from './user-profile-security-list';
import { fill, userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileMfaMethod {
  id: string;
  type: 'sms' | 'authenticator' | 'backup-codes';
  label?: string;
  description?: string;
  removable?: boolean;
  isDefault?: boolean;
}

export type UserProfileMfaAddableMethod = Extract<UserProfileMfaMethod['type'], 'sms' | 'authenticator'>;

export interface UserProfileMfaSectionViewProps {
  methods: UserProfileMfaMethod[];
  addableMethods?: UserProfileMfaAddableMethod[];
  sectionTitle?: string;
  onAdd?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onEnableBackupCodes?: () => void;
  onSetDefault?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const labels: Record<UserProfileMfaMethod['type'], string> = {
  sms: m.sections.phone,
  authenticator: m.sections.authenticator,
  'backup-codes': m.backupCodes.title,
};

const defaultAddableMethods: UserProfileMfaAddableMethod[] = ['sms', 'authenticator'];

export function UserProfileMfaSectionView({
  methods,
  addableMethods = defaultAddableMethods,
  sectionTitle,
  onAdd,
  onRegenerateBackupCodes,
  onEnableBackupCodes,
  onSetDefault,
  onRemove,
}: UserProfileMfaSectionViewProps) {
  const availableMethods = addableMethods.filter(
    type => type === 'sms' || !methods.some(method => method.type === type),
  );
  const hasConfiguredMethod = methods.some(method => method.type === 'sms' || method.type === 'authenticator');
  const visibleMethods = methods.filter(method => method.type !== 'backup-codes' || hasConfiguredMethod);

  return (
    <UserProfileSecurityList
      addControl={
        (onAdd && availableMethods.length > 0) ||
        (onEnableBackupCodes && hasConfiguredMethod && !methods.some(method => method.type === 'backup-codes')) ? (
          <Menu.Root placement='bottom-end'>
            <Menu.Trigger
              aria-label={m.sections.addVerification}
              render={props => (
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  {...props}
                />
              )}
            >
              <Icon
                name='plus'
                placement='inline-start'
                size='sm'
              />
              {m.sections.add}
            </Menu.Trigger>
            <Menu.Content>
              {availableMethods.map(type => (
                <Menu.Item
                  key={type}
                  label={labels[type]}
                  onClick={() => onAdd?.(type)}
                />
              ))}
              {onEnableBackupCodes && hasConfiguredMethod && !methods.some(method => method.type === 'backup-codes') ? (
                <Menu.Item
                  label={m.backupCodes.title}
                  onClick={onEnableBackupCodes}
                />
              ) : null}
            </Menu.Content>
          </Menu.Root>
        ) : null
      }
      addLabel={m.sections.addVerification}
      emptyLabel={m.sections.noVerification}
      hasItems={visibleMethods.length > 0}
      label={m.sections.twoStep}
      sectionTitle={sectionTitle}
    >
      {visibleMethods.map(method => {
        const label = method.label ?? labels[method.type];
        const actions: UserProfileMenuAction[] = [];

        if (method.type === 'backup-codes') {
          if (onRegenerateBackupCodes) {
            actions.push({
              label: m.sections.regenerateBackupCodes,
              onClick: onRegenerateBackupCodes,
            });
          }
        } else {
          if (method.type === 'sms' && !method.isDefault && onSetDefault) {
            actions.push({ label: m.sections.setDefault, onClick: () => onSetDefault(method.id) });
          }
          if (onRemove && method.removable !== false) {
            actions.push({ label: m.sections.removeMethod, color: 'negative', onClick: () => onRemove(method.id) });
          }
        }

        return (
          <Section.Item key={method.id}>
            <UserProfileSecurityIcon name={method.type} />
            <Section.Content>
              <Section.Label>
                {label} {method.isDefault ? <Badge color='neutral'>{m.sections.default}</Badge> : null}
              </Section.Label>
              {method.description ? <Section.Description>{method.description}</Section.Description> : null}
            </Section.Content>
            <Section.Actions>
              <UserProfileActionMenu
                actions={actions}
                label={fill(m.sections.manage, { name: label })}
              />
            </Section.Actions>
          </Section.Item>
        );
      })}
    </UserProfileSecurityList>
  );
}
