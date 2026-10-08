import { ClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/shared/types';
import type { MutableRefObject } from 'react';
import { useReducer, useRef } from 'react';

import type { AddPhoneData, PhoneFormData, PhoneFormProps } from './phone-form.types';
import { useProfileRequestScopeModel } from './profile-request-scope.model';

export const usePhoneFormModel = ({ phoneId }: PhoneFormProps): PhoneFormData => {
  const clerk = useClerk();
  const resourceRef = useRef<PhoneNumberResource>();
  const createdFallback = useRef(false);
  const owner = useRef({ key: '', version: 0 });
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const addPhone = useAddPhoneModel(
    resourceRef,
    () => {
      createdFallback.current = true;
      owner.current = { ...owner.current, version: owner.current.version + 1 };
      refresh();
    },
    JSON.stringify(['profile-phone', phoneId]),
  );
  if (owner.current.key !== addPhone.requestKey) {
    resourceRef.current = undefined;
    createdFallback.current = false;
    owner.current = { key: addPhone.requestKey, version: owner.current.version + 1 };
  }
  const selectedOwner = owner.current;
  const resolve = () => {
    if (!addPhone.canRun()) {
      return undefined;
    }
    const id = phoneId ?? resourceRef.current?.id;
    const canonical = id ? clerk.user?.phoneNumbers.find(phone => phone.id === id) : undefined;
    if (canonical && !phoneId) {
      resourceRef.current = canonical;
      createdFallback.current = false;
    }
    return canonical ?? (!phoneId && createdFallback.current ? resourceRef.current : undefined);
  };
  const phone = resolve();
  const canRun = () => addPhone.canRun() && owner.current === selectedOwner;
  const verify = async (operation: (phone: PhoneNumberResource) => Promise<unknown>) => {
    if (!canRun()) {
      return;
    }
    const current = resolve();
    if (!current) {
      throw new ClerkRuntimeError('The selected phone number is no longer available.', {
        code: 'phone_number_missing',
      });
    }
    try {
      await operation(current);
    } catch (error) {
      if (canRun()) {
        throw error;
      }
    }
  };

  return {
    requestKey: addPhone.requestKey,
    hasExistingPhone: !!phone,
    addPhone,
    verification: {
      requestKey: JSON.stringify([addPhone.requestKey, selectedOwner.version, phone?.id]),
      canRun,
      identifier: phone?.phoneNumber || '',
      attemptVerification: code => verify(current => current.attemptVerification({ code })),
      prepareVerification: () => verify(current => current.prepareVerification()),
    },
  };
};

export const useAddPhoneModel = (
  resourceRef: MutableRefObject<PhoneNumberResource | undefined>,
  onCreated?: () => void,
  target = 'create-profile-phone',
): AddPhoneData & { requestKey: string; canRun: () => boolean } => {
  const clerk = useClerk();
  const { user } = useUser();
  const scope = useProfileRequestScopeModel(target);
  const createPhoneNumber = useReverification((phoneNumber: string, isCurrent: () => boolean) =>
    isCurrent() ? clerk.user?.createPhoneNumber({ phoneNumber }) : undefined,
  );

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    username: user?.username,
    hasExistingNumber: !!user?.phoneNumbers?.length,
    createPhone: async (phoneNumber: string, canContinue?: () => boolean) => {
      const isCurrent = () => scope.canRun() && (canContinue?.() ?? true);
      if (!isCurrent()) {
        return false;
      }
      try {
        const phone = await createPhoneNumber(phoneNumber, isCurrent);
        if (!phone || !isCurrent()) {
          return false;
        }
        resourceRef.current = phone;
        onCreated?.();
        return true;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  };
};
