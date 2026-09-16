import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Menu } from '../../components/menu';
import { UserProfileMfaRowView } from './user-profile-mfa-row.view';
import { userProfileMfaMessages as m } from './user-profile-mfa-section.messages';
import { UserProfileSecurityList } from './user-profile-security-list';

export interface UserProfileMfaMethod {
  id: string;
  type: 'sms' | 'authenticator' | 'backup-codes';
  label?: string;
  description?: string;
  isDefault?: boolean;
  canRemove?: boolean;
  canSetDefault?: boolean;
}

export type UserProfileMfaAddableMethod = Extract<UserProfileMfaMethod['type'], 'sms' | 'authenticator'>;

export interface UserProfileMfaSectionViewProps {
  methods: UserProfileMfaMethod[];
  sectionTitle?: string;
  onAdd?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onRemove?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

const addableMethods: UserProfileMfaAddableMethod[] = ['sms', 'authenticator'];

export function UserProfileMfaSectionView({
  methods,
  sectionTitle,
  onAdd,
  onRegenerateBackupCodes,
  onRemove,
  onSetDefault,
}: UserProfileMfaSectionViewProps) {
  const availableMethods = addableMethods.filter(type => !methods.some(method => method.type === type));

  return (
    <UserProfileSecurityList
      addControl={
        onAdd && availableMethods.length > 0 ? (
          <Menu.Root placement='bottom-end'>
            <Menu.Trigger
              aria-label={m.addLabel}
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
              {m.add}
            </Menu.Trigger>
            <Menu.Popup>
              {availableMethods.map(type => (
                <Menu.Item
                  key={type}
                  label={m.methods[type]}
                  onClick={() => onAdd(type)}
                >
                  <Menu.Label>{m.methods[type]}</Menu.Label>
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Root>
        ) : null
      }
      addLabel={m.addLabel}
      emptyLabel={m.empty}
      hasItems={methods.length > 0}
      label={m.label}
      sectionTitle={sectionTitle}
    >
      {methods.map(method => (
        <UserProfileMfaRowView
          key={method.id}
          method={method}
          onRemove={onRemove}
          onSetDefault={onSetDefault}
          onRegenerateBackupCodes={onRegenerateBackupCodes}
        />
      ))}
    </UserProfileSecurityList>
  );
}
