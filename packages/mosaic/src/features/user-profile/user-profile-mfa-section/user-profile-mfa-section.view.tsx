import { type ReactNode, type Ref } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Section } from '../../../components/section';
import { fill, type MosaicMessages, useMessages } from '../../../localization';
import { UserProfileSecurityList } from '../user-profile-security-list';
import { UserProfileAddMfaDialog } from './user-profile-add-mfa.dialog';
import { UserProfileAddMfaView } from './user-profile-add-mfa.view';
import { UserProfileMfaRowView } from './user-profile-mfa-row.view';
import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.types';
import { useUserProfileMfaSectionLeafController } from './user-profile-mfa-section-leaf.controller';

export type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.types';

export interface UserProfileMfaSectionViewProps {
  methods: UserProfileMfaMethod[];
  addableMethods?: readonly UserProfileMfaAddableMethod[];
  addButtonRef?: Ref<HTMLButtonElement>;
  addControl?: ReactNode;
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
  onAdd,
  onRegenerateBackupCodes,
  onRemove,
  onSetDefault,
}: UserProfileMfaSectionViewProps) {
  const m = useMessages('userProfileMfa');
  const controller = useUserProfileMfaSectionLeafController({ methods, onRemove, onSetDefault });

  return (
    <>
      <UserProfileSecurityList
        sectionRef={controller.sectionRef}
        addControl={
          addControl ??
          (onAdd && addableMethods?.length ? (
            <UserProfileAddMfaDialog
              triggerRef={addButtonRef}
              open={controller.pickerOpen}
              onOpenChange={controller.onPickerOpenChange}
            >
              <UserProfileAddMfaView
                methods={addableMethods}
                onSelect={type => {
                  onAdd(type);
                  controller.closePicker();
                }}
              />
            </UserProfileAddMfaDialog>
          ) : null)
        }
        addLabel={m.addLabel}
        emptyLabel={m.empty}
        hasItems={methods.length > 0}
        label={m.label}
      >
        {methods.map(method => (
          <UserProfileMfaRowView
            key={method.id}
            method={method}
            triggerRef={controller.registerTrigger(method.id)}
            onRemove={onRemove ? () => controller.openRemoval(method) : undefined}
            onSetDefault={
              onSetDefault && !controller.isSettingDefault ? id => void controller.setDefault(id) : undefined
            }
            onRegenerateBackupCodes={onRegenerateBackupCodes}
          />
        ))}
      </UserProfileSecurityList>
      <Section.Error>{controller.defaultError}</Section.Error>
      {onRemove && controller.removal ? (
        <Confirmation
          open
          onOpenChange={controller.onRemovalOpenChange}
          title={controller.removal.method.type === 'sms' ? m.removeDialog.smsTitle : m.removeDialog.authenticatorTitle}
          description={describeMethodRemoval(controller.removal.method, m)}
          actionLabel={m.removeDialog.confirm}
          finalFocus={controller.finalRemovalFocus}
          onConfirm={controller.confirmRemoval}
          isConfirming={controller.removal.status === 'pending'}
          errorMessage={controller.removal.error}
        />
      ) : null}
    </>
  );
}

function describeMethodRemoval(method: UserProfileMfaMethod, m: MosaicMessages['userProfileMfa']) {
  if (method.type === 'sms') {
    return method.description
      ? fill(m.removeDialog.smsDescription, { phoneNumber: method.description })
      : m.removeDialog.smsDescriptionWithoutNumber;
  }
  return m.removeDialog.authenticatorDescription;
}
