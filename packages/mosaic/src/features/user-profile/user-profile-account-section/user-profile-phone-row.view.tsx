import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { useMemo } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import { useContactList } from './use-contact-list';
import type { UserProfilePhone } from './user-profile-account-section.types';
import type { UserProfileAddPhoneControllerOptions } from './user-profile-add-phone.controller';
import { useUserProfileAddPhoneController } from './user-profile-add-phone.controller';
import { UserProfileAddPhoneDialog } from './user-profile-add-phone.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';

export interface UserProfilePhoneRowViewProps {
  phones: UserProfilePhone[];
  allowMultipleAccounts?: boolean;
  onSendPhoneCode?: (phoneNumber: string) => Promise<void>;
  onVerifyPhoneCode?: (phoneNumber: string, code: string) => Promise<void>;
  onManagePhone?: (id: string) => void;
  onVerifyPhone?: (id: string) => void;
  onSetPrimaryPhone?: (id: string) => void | Promise<void>;
  onRemovePhone?: (id: string) => void | Promise<void>;
}

export function UserProfilePhoneRowView({
  phones,
  allowMultipleAccounts = false,
  onSendPhoneCode,
  onVerifyPhoneCode,
  onManagePhone,
  onVerifyPhone,
  onSetPrimaryPhone,
  onRemovePhone,
}: UserProfilePhoneRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const formattedPhones = useMemo(
    () => phones.map(phone => ({ ...phone, value: stringToFormattedPhoneString(phone.value) })),
    [phones],
  );
  const list = useContactList({
    items: formattedPhones,
    onSetPrimary: onSetPrimaryPhone,
    primaryErrorMessage: m.phone.primaryError,
  });
  const removalFocus = useListRemovalFocus({
    ids: list.shownItems.map(phone => phone.id),
    onRemove: onRemovePhone,
    fallback: list.removalFallback,
  });
  const addPhoneAction =
    onSendPhoneCode && onVerifyPhoneCode ? (
      <AddPhone
        options={{ onSend: onSendPhoneCode, onVerify: onVerifyPhoneCode }}
        compact={allowMultipleAccounts}
      />
    ) : undefined;
  const removePhoneConfirmation = useMemo(() => Confirmation.createHandle<UserProfilePhone>(), []);
  const removePhone = (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    if (phone && phone.canRemove !== false && onRemovePhone) {
      removePhoneConfirmation.open(phone);
    }
  };
  if (!allowMultipleAccounts) {
    return (
      <UserProfileContactRowView
        items={formattedPhones}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onManage={onManagePhone}
      />
    );
  }

  return (
    <>
      <UserProfileContactListRowView
        rowRef={list.row}
        triggerRef={removalFocus.registerTrigger}
        items={list.shownItems}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onRemove={onRemovePhone ? removePhone : undefined}
        onSetPrimary={list.setPrimary}
        pendingId={list.pendingPrimaryId}
        shownPendingId={list.shownPendingId}
        onVerify={onVerifyPhone}
      >
        <Section.Error>{list.primaryError}</Section.Error>
      </UserProfileContactListRowView>
      {onRemovePhone ? (
        <Confirmation
          handle={removePhoneConfirmation}
          title={m.phone.removeDialog.title}
          description={phone =>
            fill(m.phone.removeDialog.description, { phoneNumber: stringToFormattedPhoneString(phone.value) })
          }
          actionLabel={m.phone.removeDialog.confirm}
          cancelLabel={m.phone.removeDialog.cancel}
          finalFocus={removalFocus.finalFocus}
          onConfirm={phone => removalFocus.remove(phone.id)}
        />
      ) : null}
    </>
  );
}

function AddPhone({ options, compact }: { options: UserProfileAddPhoneControllerOptions; compact: boolean }) {
  const m = useMessages('userProfileAccountSection');
  const controller = useUserProfileAddPhoneController(options);
  return (
    <UserProfileAddPhoneDialog
      {...controller}
      trigger={
        <Button
          aria-label={m.phone.add}
          color='neutral'
          size='sm'
          variant='outline'
        >
          {compact ? (
            <Icon
              name='plus'
              placement='inline-start'
              size='sm'
            />
          ) : null}
          {compact ? m.add : m.phone.add}
        </Button>
      }
    />
  );
}
