import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import type { ReactNode, Ref } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { ReverificationDialog } from '../../../blocks/reverification';
import { Section } from '../../../components/section';
import type { PendingAction } from '../../../hooks/use-pending-action';
import { fill, type MosaicMessages, useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import { UserProfileSecurityList } from '../user-profile-security-list';
import { UserProfileAddMfaDialog } from './user-profile-add-mfa.dialog';
import { UserProfileAddMfaView } from './user-profile-add-mfa.view';
import { UserProfileMfaRowView } from './user-profile-mfa-row.view';
import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.types';
import { useUserProfileMfaSectionLeafController } from './user-profile-mfa-section-leaf.controller';

export type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.types';

export interface UserProfileMfaSectionViewProps {
  methods: UserProfileMfaMethod[];
  pendingAction?: PendingAction<string>;
  addableMethods?: readonly UserProfileMfaAddableMethod[];
  addButtonRef?: Ref<HTMLButtonElement>;
  addControl?: ReactNode;
  onAdd?: (type: UserProfileMfaAddableMethod) => void;
  regenerate?: { onClick: () => void; status: 'idle' | 'pending'; error?: string };
  onRemove?: (id: string) => void | Promise<void>;
  onSetDefault?: (id: string) => void | Promise<void>;
  removeReverification?: ReverificationController;
  setDefaultReverification?: ReverificationController;
}

export function UserProfileMfaSectionView({
  methods,
  pendingAction,
  addableMethods,
  addButtonRef,
  addControl,
  onAdd,
  regenerate,
  onRemove,
  onSetDefault,
  removeReverification,
  setDefaultReverification,
}: UserProfileMfaSectionViewProps) {
  const m = useMessages('userProfileMfa');
  const controller = useUserProfileMfaSectionLeafController({
    methods,
    pendingAction,
    onAdd,
    onRemove,
    onSetDefault,
    removeReverification,
  });

  return (
    <>
      <UserProfileSecurityList
        sectionRef={controller.sectionRef}
        addControl={
          addControl ??
          (controller.addMethod && addableMethods?.length ? (
            <UserProfileAddMfaDialog
              triggerRef={addButtonRef}
              disabled={controller.isDisabled}
              open={controller.pickerOpen}
              onOpenChange={controller.onPickerOpenChange}
            >
              <UserProfileAddMfaView
                methods={addableMethods}
                onSelect={controller.addMethod}
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
            isDisabled={controller.isDisabled}
            triggerRef={controller.registerTrigger(method.id)}
            onRemove={controller.remove ? () => controller.openRemoval(method) : undefined}
            onSetDefault={controller.setDefault}
            regenerate={regenerate}
          />
        ))}
      </UserProfileSecurityList>
      <Section.Error>{regenerate?.error ?? controller.defaultError}</Section.Error>
      {controller.remove ? (
        <Confirmation
          controller={controller.remove}
          title={method => (method.type === 'sms' ? m.removeDialog.smsTitle : m.removeDialog.authenticatorTitle)}
          description={method => describeMethodRemoval(method, m)}
          actionLabel={m.removeDialog.confirm}
          finalFocus={controller.finalRemovalFocus}
        />
      ) : null}
      {setDefaultReverification ? (
        <ReverificationDialog
          controller={setDefaultReverification}
          finalFocus={controller.setDefaultFinalFocus}
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
