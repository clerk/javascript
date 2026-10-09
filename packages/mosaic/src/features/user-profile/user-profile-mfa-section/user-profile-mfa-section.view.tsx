import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { type ReactNode, type Ref, useMemo } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Section } from '../../../components/section';
import { fill, type MosaicMessages, useMessages } from '../../../localization';
import { useStableOrder } from '../../../primitives/hooks';
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

const byId = (method: UserProfileMfaMethod) => method.id;

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
  const ordered = useStableOrder(methods, byId);
  const controller = useUserProfileMfaSectionLeafController({ methods: ordered, onRemove, onSetDefault });
  const removeMethod = useMemo(() => Confirmation.createHandle<UserProfileMfaMethod>(), []);

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
        items={ordered}
        getKey={byId}
        label={m.label}
      >
        {(method, { present }) => (
          <UserProfileMfaRowView
            method={method}
            triggerRef={present ? controller.registerTrigger(method.id) : undefined}
            onRemove={onRemove ? () => controller.openRemoval(() => removeMethod.open(method)) : undefined}
            onSetDefault={onSetDefault && !controller.isSettingDefault ? controller.setDefault : undefined}
            onRegenerateBackupCodes={onRegenerateBackupCodes}
          />
        )}
      </UserProfileSecurityList>
      <Section.Error>{controller.defaultError}</Section.Error>
      {onRemove ? (
        <Confirmation
          handle={removeMethod}
          title={method => (method.type === 'sms' ? m.removeDialog.smsTitle : m.removeDialog.authenticatorTitle)}
          description={method => describeMethodRemoval(method, m)}
          actionLabel={m.removeDialog.confirm}
          finalFocus={controller.finalRemovalFocus}
          onConfirm={controller.confirmRemoval}
        />
      ) : null}
    </>
  );
}

function describeMethodRemoval(method: UserProfileMfaMethod, m: MosaicMessages['userProfileMfa']) {
  if (method.type === 'sms') {
    return method.description
      ? fill(m.removeDialog.smsDescription, { phoneNumber: stringToFormattedPhoneString(method.description) })
      : m.removeDialog.smsDescriptionWithoutNumber;
  }
  return m.removeDialog.authenticatorDescription;
}
