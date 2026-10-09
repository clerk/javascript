import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import type { CountryIso } from '../../../components/phone-input';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import type { UserProfilePhone, UserProfilePhoneVerifier } from './user-profile-account-section.types';
import { UserProfileAddPhoneDialog } from './user-profile-add-phone.dialog';
import { UserProfileContactListRowView } from './user-profile-contact-list-row.view';
import { UserProfileContactRowView } from './user-profile-contact-row.view';
import { useUserProfilePhoneRowController } from './user-profile-phone-row.controller';

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
  const {
    phones: items,
    verification,
    error,
    onVerify,
    onSetPrimary,
  } = useUserProfilePhoneRowController({
    phones,
    onCreatePhone,
    getPhoneVerifier,
    onVerifyPhone,
    onSetPrimaryPhone,
  });
  const verificationDialog = useMemo(() => Dialog.createHandle(), []);
  const removePhoneConfirmation = useMemo(() => Confirmation.createHandle<UserProfilePhone>(), []);
  const verifyingId = useRef<string | undefined>(undefined);
  const addPhoneAction =
    verification && onCreatePhone ? (
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

  const dialog = verification ? (
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
          items={items}
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
        items={items}
        kind='phone'
        label={m.phone.label}
        addAction={addPhoneAction}
        onRemove={onRemovePhone ? phone => removePhoneConfirmation.open(phone) : undefined}
        onSetPrimary={onSetPrimary}
        onVerify={
          onVerify
            ? id => {
                verifyingId.current = id;
                onVerify(id);
              }
            : undefined
        }
      >
        <Section.Error>{error}</Section.Error>
      </UserProfileContactListRowView>
      {dialog}
      {onRemovePhone ? (
        <Confirmation
          handle={removePhoneConfirmation}
          title={m.phone.removeDialog.title}
          description={phone =>
            fill(phone.isVerified ? m.phone.removeDialog.verifiedDescription : m.phone.removeDialog.description, {
              phoneNumber: phone.value,
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
