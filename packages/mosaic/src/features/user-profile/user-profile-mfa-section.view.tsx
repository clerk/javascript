import { useMemo } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Menu } from '../../components/menu';
import { fill } from '../../utils/messages';
import { UserProfileMfaRowView } from './user-profile-mfa-row.view';
import { useUserProfileMfaSectionController } from './user-profile-mfa-section.controller';
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
  onRemove?: (id: string) => void | Promise<void>;
  onSetDefault?: (id: string) => void | Promise<void>;
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
  const removeMethod = useMemo(() => Confirmation.createHandle<UserProfileMfaMethod>(), []);
  const controller = useUserProfileMfaSectionController({ methods, onSetDefault });
  const isSettingDefault = controller.pendingMethodId !== undefined;
  const availableMethods = addableMethods.filter(type => !methods.some(method => method.type === type));

  return (
    <>
      <UserProfileSecurityList
        addControl={
          onAdd && availableMethods.length > 0 ? (
            <Menu.Root placement='bottom-end'>
              <Menu.Trigger
                aria-label={m.addLabel}
                disabled={isSettingDefault}
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
            onRemove={onRemove ? () => removeMethod.open(method) : undefined}
            onSetDefault={controller.onSetDefault}
            isPending={controller.pendingMethodId === method.id}
            disabled={isSettingDefault}
            errorMessage={controller.errorMethodId === method.id ? controller.errorMessage : undefined}
            onRegenerateBackupCodes={onRegenerateBackupCodes}
          />
        ))}
      </UserProfileSecurityList>
      {onRemove ? (
        <Confirmation
          handle={removeMethod}
          title={method => (method.type === 'sms' ? m.removeDialog.smsTitle : m.removeDialog.authenticatorTitle)}
          description={describeMethodRemoval}
          actionLabel={m.removeDialog.confirm}
          onConfirm={method => onRemove(method.id)}
        />
      ) : null}
    </>
  );
}

function describeMethodRemoval(method: UserProfileMfaMethod) {
  if (method.type === 'sms') {
    return method.description
      ? fill(m.removeDialog.smsDescription, { phoneNumber: method.description })
      : m.removeDialog.smsDescriptionWithoutNumber;
  }
  return m.removeDialog.authenticatorDescription;
}
