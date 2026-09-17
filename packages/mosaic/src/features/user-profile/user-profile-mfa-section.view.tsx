import { type ReactNode, type Ref, useMemo } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { fill } from '../../localization';
import { UserProfileAddMfaDialog } from './user-profile-add-mfa.dialog';
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

export type UserProfileMfaAddableMethod = 'sms' | 'authenticator' | 'backup-codes';

export interface UserProfileMfaSectionViewProps {
  methods: UserProfileMfaMethod[];
  addableMethods?: readonly UserProfileMfaAddableMethod[];
  addButtonRef?: Ref<HTMLButtonElement>;
  addControl?: ReactNode;
  sectionTitle?: string;
  onAdd?: (type: UserProfileMfaAddableMethod) => void;
  onRegenerateBackupCodes?: () => void;
  onRemove?: (id: string) => void | Promise<void>;
  onSetDefault?: (id: string) => void | Promise<void>;
}

export function UserProfileMfaSectionView({
  methods,
  addableMethods,
  addButtonRef,
  addControl,
  sectionTitle,
  onAdd,
  onRegenerateBackupCodes,
  onRemove,
  onSetDefault,
}: UserProfileMfaSectionViewProps) {
  const removeMethod = useMemo(() => Confirmation.createHandle<UserProfileMfaMethod>(), []);
  const controller = useUserProfileMfaSectionController({ methods, onSetDefault });
  const isSettingDefault = controller.pendingMethodId !== undefined;

  return (
    <>
      <UserProfileSecurityList
        addControl={
          addControl ??
          (onAdd && addableMethods?.length ? (
            <UserProfileAddMfaDialog
              triggerRef={addButtonRef}
              methods={addableMethods}
              onSelect={onAdd}
              disabled={isSettingDefault}
            />
          ) : null)
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
