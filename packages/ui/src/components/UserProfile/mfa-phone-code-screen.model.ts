import { ClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/shared/types';
import { useReducer, useRef } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { getCountryFromPhoneString, stringToFormattedPhoneString } from '@/ui/utils/phoneUtils';

import type { MfaPhoneCodeScreenData } from './mfa-phone-code-screen.types';
import { useAddPhoneModel } from './phone-form.model';
import { useProfileRequestScopeModel } from './profile-request-scope.model';

export const useMfaPhoneCodeScreenModel = (): MfaPhoneCodeScreenData => {
  const clerk = useClerk();
  const { user } = useUser();
  const scope = useProfileRequestScopeModel('mfa-phone');
  const resourceRef = useRef<PhoneNumberResource>();
  const createdRef = useRef<PhoneNumberResource>();
  const selection = useRef({ key: scope.requestKey, version: 0 });
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  if (selection.current.key !== scope.requestKey) {
    resourceRef.current = undefined;
    createdRef.current = undefined;
    selection.current = { key: scope.requestKey, version: selection.current.version + 1 };
  }
  const selectedOwner = selection.current;
  const select = (phone: PhoneNumberResource, replace = true) => {
    if (replace || resourceRef.current?.id !== phone.id) {
      selection.current = { key: scope.requestKey, version: selection.current.version + 1 };
    }
    resourceRef.current = phone;
    refresh();
  };
  const addPhone = useAddPhoneModel(resourceRef, () => {
    createdRef.current = resourceRef.current;
    if (resourceRef.current) {
      select(resourceRef.current);
    }
  });
  const resolve = (id: string | undefined) => {
    if (!scope.canRun() || !id) {
      return undefined;
    }
    const canonical = clerk.user?.phoneNumbers.find(phone => phone.id === id);
    if (canonical) {
      if (createdRef.current?.id === id) {
        createdRef.current = undefined;
      }
      return canonical;
    }
    return createdRef.current?.id === id ? createdRef.current : undefined;
  };
  const setReservedForSecondFactor = useReverification((id: string, isCurrent: () => boolean) => {
    const current = isCurrent() ? resolve(id) : undefined;
    return current && !current.reservedForSecondFactor
      ? current.setReservedForSecondFactor({ reserved: true })
      : undefined;
  });
  const enablePhone = async (id: string | undefined, canContinue: () => boolean = () => true) => {
    const isCurrent = () => scope.canRun() && canContinue();
    const current = resolve(id);
    if (!id || !isCurrent() || !current || current.reservedForSecondFactor) {
      return false;
    }
    try {
      const phone = await setReservedForSecondFactor(id, isCurrent);
      if (!phone || !isCurrent()) {
        return false;
      }
      select(resolve(id) ?? current, false);
      return true;
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return false;
    }
  };
  const phone = resourceRef.current;
  const canVerify = () =>
    !!phone?.id && scope.canRun() && selection.current === selectedOwner && resourceRef.current?.id === phone.id;
  const verify = async (operation: (current: PhoneNumberResource) => Promise<unknown>) => {
    if (!canVerify()) {
      return;
    }
    const current = resolve(phone?.id);
    if (!current) {
      throw new ClerkRuntimeError('The selected phone number is no longer available.', {
        code: 'phone_number_missing',
      });
    }
    try {
      await operation(current);
    } catch (error) {
      if (canVerify()) {
        throw error;
      }
    }
  };
  const hasBackupCodes = Boolean(useEnvironment().userSettings.attributes.backup_code?.enabled);
  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    hasBackupCodes,
    hasNewBackupCodes: Boolean(phone?.backupCodes?.length),
    backupCodes: phone?.backupCodes?.slice(),
    addPhone,
    selectPhone: id => {
      const current = resolve(id);
      if (!current) {
        return false;
      }
      select(current);
      return true;
    },
    enablePhone,
    verifyPhone: {
      id: phone?.id,
      requestKey: JSON.stringify([scope.requestKey, selectedOwner.version, phone?.id]),
      canRun: canVerify,
      verification: {
        requestKey: JSON.stringify([scope.requestKey, selectedOwner.version, phone?.id]),
        canRun: canVerify,
        identifier: phone?.phoneNumber || '',
        prepareVerification: () => verify(current => current.prepareVerification()),
        attemptVerification: code => verify(current => current.attemptVerification({ code })),
      },
      enableMfa: canContinue => enablePhone(phone?.id, () => canVerify() && (canContinue?.() ?? true)),
    },
    addMfa: {
      hasUser: !!user,
      phones: (user?.phoneNumbers ?? [])
        .filter(phone => !phone.reservedForSecondFactor)
        .map(phone => {
          const { country } = getCountryFromPhoneString(phone.phoneNumber);
          return {
            id: phone.id,
            label: `${country.iso.toUpperCase()} ${stringToFormattedPhoneString(phone.phoneNumber)}`,
            isVerified: phone.verification.status === 'verified',
          };
        }),
    },
  };
};
