import { useMemo, useRef, useState } from 'react';

import { stringToFormattedPhoneString } from '../../../../utils/phoneUtils';
import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
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
  const addPhoneAction =
    onSendPhoneCode && onVerifyPhoneCode ? (
      <AddPhone
        options={{ onSend: onSendPhoneCode, onVerify: onVerifyPhoneCode }}
        compact={allowMultipleAccounts}
      />
    ) : undefined;
  const removePhoneConfirmation = useMemo(() => Confirmation.createHandle<UserProfilePhone>(), []);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [primaryError, setPrimaryError] = useState<string>();
  const settingPrimary = useRef(false);

  const setPrimaryPhone = async (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    if (!onSetPrimaryPhone || !phone?.isVerified || phone.isDefault || settingPrimary.current) {
      return;
    }
    settingPrimary.current = true;
    setIsSettingPrimary(true);
    setPrimaryError(undefined);
    try {
      await onSetPrimaryPhone(id);
    } catch (error) {
      setPrimaryError(error instanceof Error ? error.message : m.phone.primaryError);
    } finally {
      settingPrimary.current = false;
      setIsSettingPrimary(false);
    }
  };

  const removePhone = (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    if (phone && phone.canRemove !== false && onRemovePhone) {
      removePhoneConfirmation.open(phone);
    }
  };
  const formattedPhones = phones.map(phone => ({
    ...phone,
    value: stringToFormattedPhoneString(phone.value),
  }));

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
        items={formattedPhones}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onRemove={onRemovePhone ? removePhone : undefined}
        onSetPrimary={onSetPrimaryPhone && !isSettingPrimary ? id => void setPrimaryPhone(id) : undefined}
        onVerify={onVerifyPhone}
      />
      {primaryError ? (
        <Text
          role='alert'
          color='negative'
        >
          {primaryError}
        </Text>
      ) : null}
      {onRemovePhone ? (
        <Confirmation
          handle={removePhoneConfirmation}
          title={m.phone.removeDialog.title}
          description={describePhoneRemoval}
          actionLabel={m.phone.removeDialog.confirm}
          cancelLabel={m.phone.removeDialog.cancel}
          onConfirm={phone => onRemovePhone(phone.id)}
        />
      ) : null}
    </>
  );
}

function AddPhone({ options, compact }: { options: UserProfileAddPhoneControllerOptions; compact: boolean }) {
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

function describePhoneRemoval(phone: UserProfilePhone) {
  return (
    <>
      <strong>{stringToFormattedPhoneString(phone.value)}</strong> will be removed from your account. You won’t be able
      to use it to sign in.
    </>
  );
}
