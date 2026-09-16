import { useRef, useState } from 'react';

import { stringToFormattedPhoneString } from '../../../../utils/phoneUtils';
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
import { UserProfileRemovePhoneDialog } from './user-profile-remove-phone.dialog';

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
  const [phoneToRemove, setPhoneToRemove] = useState<UserProfilePhone>();
  const [removeError, setRemoveError] = useState<string>();
  const removing = useRef(false);
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
    if (!phone || phone.canRemove === false || !onRemovePhone || removing.current) {
      return;
    }
    setPhoneToRemove(phone);
    setRemoveError(undefined);
  };

  const confirmRemovePhone = async () => {
    if (!phoneToRemove || !onRemovePhone || removing.current) {
      return;
    }
    removing.current = true;
    setPhoneToRemove(undefined);
    try {
      await onRemovePhone(phoneToRemove.id);
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : m.phone.removeError);
    } finally {
      removing.current = false;
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
        renderActionDialog={
          onRemovePhone
            ? phone => (
                <UserProfileRemovePhoneDialog
                  phoneNumber={phone.value}
                  open={phoneToRemove?.id === phone.id}
                  onOpenChange={open => {
                    if (!open) {
                      setPhoneToRemove(undefined);
                    }
                  }}
                  onConfirm={() => void confirmRemovePhone()}
                />
              )
            : undefined
        }
      />
      {primaryError ? (
        <Text
          role='alert'
          color='negative'
        >
          {primaryError}
        </Text>
      ) : null}
      {removeError ? (
        <Text
          role='alert'
          color='negative'
        >
          {removeError}
        </Text>
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
