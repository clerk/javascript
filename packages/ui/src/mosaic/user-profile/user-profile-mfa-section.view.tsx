import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Menu } from '../components/menu';
import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { UserProfileSecurityIcon } from './user-profile-security-icon';
import { UserProfileSecurityList } from './user-profile-security-list';

export interface UserProfileMfaMethod {
  id: string;
  type: 'sms' | 'authenticator' | 'backup-codes';
  label?: string;
  description?: string;
}

export type UserProfileMfaAddableMethod = Extract<UserProfileMfaMethod['type'], 'sms' | 'authenticator'>;

export interface UserProfileMfaSectionViewProps {
  methods: UserProfileMfaMethod[];
  sectionTitle?: string;
  onAdd?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onRemove?: (id: string) => void;
}

const labels: Record<UserProfileMfaMethod['type'], string> = {
  sms: 'Phone number',
  authenticator: 'Authenticator app',
  'backup-codes': 'Backup codes',
};

const addableMethods: UserProfileMfaAddableMethod[] = ['sms', 'authenticator'];

export function UserProfileMfaSectionView({
  methods,
  sectionTitle,
  onAdd,
  onRegenerateBackupCodes,
  onRemove,
}: UserProfileMfaSectionViewProps) {
  const availableMethods = addableMethods.filter(type => !methods.some(method => method.type === type));
  const hasConfiguredMethod = methods.some(method => method.type === 'sms' || method.type === 'authenticator');
  const visibleMethods = methods.filter(method => method.type !== 'backup-codes' || hasConfiguredMethod);

  return (
    <UserProfileSecurityList
      addControl={
        onAdd && availableMethods.length > 0 ? (
          <Menu.Root placement='bottom-end'>
            <Menu.Trigger
              aria-label='Add verification method'
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
              Add
            </Menu.Trigger>
            <Menu.Content>
              {availableMethods.map(type => (
                <Menu.Item
                  key={type}
                  label={labels[type]}
                  onClick={() => onAdd(type)}
                />
              ))}
            </Menu.Content>
          </Menu.Root>
        ) : null
      }
      addLabel='Add verification method'
      emptyLabel='No verification methods added'
      hasItems={visibleMethods.length > 0}
      label='2-step verification'
      sectionTitle={sectionTitle}
    >
      {visibleMethods.map(method => {
        const label = method.label ?? labels[method.type];
        const actions: UserProfileMenuAction[] = [];

        if (method.type === 'backup-codes') {
          if (onRegenerateBackupCodes) {
            actions.push({
              label: 'Regenerate',
              onClick: onRegenerateBackupCodes,
            });
          }
        } else if (onRemove) {
          actions.push({ label: 'Remove method', color: 'negative', onClick: () => onRemove(method.id) });
        }

        return (
          <Section.Item key={method.id}>
            <UserProfileSecurityIcon name={method.type} />
            <Section.Content>
              <Section.Label>{label}</Section.Label>
              {method.description ? <Section.Description>{method.description}</Section.Description> : null}
            </Section.Content>
            <Section.Actions>
              <UserProfileActionMenu
                actions={actions}
                label={`Manage ${label}`}
              />
            </Section.Actions>
          </Section.Item>
        );
      })}
    </UserProfileSecurityList>
  );
}
