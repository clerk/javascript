import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import type { CountryIso } from '../../../components/phone-input';
import { Text } from '../../../components/text';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import type { UserProfilePhone, UserProfilePhoneVerifier } from './user-profile-account-section.types';
import { useUserProfileAddPhoneController } from './user-profile-add-phone.controller';
import { UserProfileAddPhoneDialog } from './user-profile-add-phone.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import { useUserProfileSetPrimaryController } from './user-profile-set-primary.controller';

export interface UserProfilePhoneRowViewProps {
  phones: UserProfilePhone[];
  defaultPhoneCountry?: CountryIso;
  allowMultipleAccounts?: boolean;
  onCreatePhone?: (phoneNumber: string) => Promise<UserProfilePhoneVerifier>;
  getPhoneVerifier?: (id: string) => UserProfilePhoneVerifier;
  onManagePhone?: (id: string) => void;
  onVerifyPhone?: (id: string) => void;
  onSetPrimaryPhone?: (id: string) => void | Promise<void>;
  onRemovePhone?: (id: string) => void | Promise<void>;
}

export function UserProfilePhoneRowView({
  phones,
  defaultPhoneCountry,
  allowMultipleAccounts = false,
  onCreatePhone,
  getPhoneVerifier,
  onManagePhone,
  onVerifyPhone,
  onSetPrimaryPhone,
  onRemovePhone,
}: UserProfilePhoneRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const row = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: phones.map(phone => phone.id),
    onRemove: onRemovePhone,
    fallback: () => row.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? row.current,
  });
  const verification = useUserProfileAddPhoneController({ onCreate: onCreatePhone });
  const verificationDialog = useMemo(() => Dialog.createHandle(), []);
  const canVerify = Boolean(getPhoneVerifier);
  const addPhoneAction =
    canVerify && onCreatePhone ? (
      <Dialog.Trigger
        handle={verificationDialog}
        render={
          <Button
            aria-label={m.phone.add}
            color='neutral'
            size='sm'
            variant='outline'
          />
        }
      >
        {allowMultipleAccounts ? (
          <Icon
            name='plus'
            placement='inline-start'
            size='sm'
          />
        ) : null}
        {allowMultipleAccounts ? m.add : m.phone.add}
      </Dialog.Trigger>
    ) : undefined;
  const verifyingId = useRef<string | undefined>(undefined);
  const verifyPhone = (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    if (phone && getPhoneVerifier) {
      verifyingId.current = id;
      verification.onVerifyPhone(phone.value, getPhoneVerifier(id));
    }
  };
  const removePhoneConfirmation = useMemo(() => Confirmation.createHandle<UserProfilePhone>(), []);
  const primary = useUserProfileSetPrimaryController({
    items: phones,
    onSetPrimary: onSetPrimaryPhone,
  });

  const removePhone = (id: string) => {
    const phone = phones.find(phone => phone.id === id);
    if (phone && onRemovePhone) {
      removePhoneConfirmation.open(phone);
    }
  };
  const formattedPhones = phones.map(phone => ({
    ...phone,
    value: stringToFormattedPhoneString(phone.value),
  }));

  const dialog = canVerify ? (
    <UserProfileAddPhoneDialog
      {...verification}
      defaultCountry={defaultPhoneCountry}
      handle={verificationDialog}
      finalFocus={() => {
        const id = verifyingId.current;
        verifyingId.current = undefined;
        return id ? removalFocus.trigger(id) : null;
      }}
    />
  ) : null;

  if (!allowMultipleAccounts) {
    return (
      <>
        <UserProfileContactRowView
          items={formattedPhones}
          kind='phone'
          label={m.phone.label}
          addAction={addPhoneAction}
          onManage={onManagePhone}
        />
        {dialog}
      </>
    );
  }

  return (
    <>
      <UserProfileContactListRowView
        rowRef={row}
        triggerRef={removalFocus.registerTrigger}
        items={formattedPhones}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onRemove={onRemovePhone ? removePhone : undefined}
        onSetPrimary={primary.onSetPrimary}
        onVerify={canVerify ? verifyPhone : onVerifyPhone}
      >
        {primary.error ? (
          <Text
            role='alert'
            color='negative'
          >
            {primary.error}
          </Text>
        ) : null}
      </UserProfileContactListRowView>
      {dialog}
      {onRemovePhone ? (
        <Confirmation
          handle={removePhoneConfirmation}
          title={m.phone.removeDialog.title}
          description={phone =>
            fill(phone.isVerified ? m.phone.removeDialog.verifiedDescription : m.phone.removeDialog.description, {
              phoneNumber: stringToFormattedPhoneString(phone.value),
            })
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
