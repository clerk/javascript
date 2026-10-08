import {
  createContextAndHook,
  useClerk,
  useReverification,
  useSafeLayoutEffect,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type { PhoneNumberResource, UserResource } from '@clerk/shared/types';
import { useReducer, useRef } from 'react';

import { getFlagEmojiFromCountryIso, parsePhoneString, stringToFormattedPhoneString } from '@/ui/utils/phoneUtils';

import type { SmsCodeFlowModel } from './sms-code-flow.types';

export const [SmsCodeFlowModelContext, useSmsCodeFlowModelContext] =
  createContextAndHook<SmsCodeFlowModel>('SmsCodeFlowModel');

const getAvailablePhonesFromUser = (user: UserResource | undefined | null) => {
  return (
    user?.phoneNumbers.filter(phoneNumber => {
      const hasOtherIdentifications =
        user?.primaryEmailAddress !== null ||
        user?.primaryWeb3Wallet !== null ||
        user?.passkeys.length > 0 ||
        user?.externalAccounts.length > 0 ||
        user?.enterpriseAccounts.length > 0 ||
        user?.username !== null;

      if (phoneNumber.id === user?.primaryPhoneNumber?.id && !hasOtherIdentifications) {
        return false;
      }
      return !phoneNumber.reservedForSecondFactor;
    }) || []
  );
};

export const useSmsCodeFlowModel = (): SmsCodeFlowModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const key = JSON.stringify([actor, sessionId, clientId]);
  const current = useRef({ key, version: 0, clerk });
  const selected = useRef({ id: undefined as string | undefined, version: 0 });
  const created = useRef<PhoneNumberResource>();
  const backups = useRef<string[]>();
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const changed = current.current.key !== key || current.current.clerk !== clerk;
  const version = current.current.version + (changed ? 1 : 0);
  if (changed) {
    selected.current = { id: undefined, version: selected.current.version + 1 };
    created.current = undefined;
    backups.current = undefined;
  }
  current.current = { key, version, clerk };
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      created.current = undefined;
      backups.current = undefined;
    };
  }, []);
  const canRun = () =>
    mounted.current &&
    current.current.version === version &&
    !!actor &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId;
  const resolve = (id: string | undefined) => {
    if (!id || !canRun()) {
      return undefined;
    }
    const phone = clerk.user?.phoneNumbers.find(phone => phone.id === id);
    if (phone) {
      if (created.current?.id === id) {
        created.current = undefined;
      }
      return phone;
    }
    return created.current?.id === id ? created.current : undefined;
  };
  const createPhoneNumber = useReverification((phoneNumber: string, isCurrent: () => boolean) =>
    isCurrent() ? clerk.user?.createPhoneNumber({ phoneNumber }) : undefined,
  );
  const reserve = useReverification((id: string, isCurrent: () => boolean) => {
    const phone = isCurrent() ? resolve(id) : undefined;
    return phone?.setReservedForSecondFactor({ reserved: true });
  });
  const select = (id: string) => {
    selected.current = { id, version: selected.current.version + 1 };
    backups.current = undefined;
    refresh();
  };
  const enablePhone = async (id: string, canContinue: () => boolean = () => true) => {
    const owner = selected.current;
    const isCurrent = () => canRun() && selected.current === owner && canContinue();
    const phone = resolve(id);
    if (!isCurrent() || !phone || phone.reservedForSecondFactor) {
      return false;
    }
    try {
      const result = await reserve(id, isCurrent);
      if (!result || !isCurrent()) {
        return false;
      }
      backups.current = result.backupCodes?.slice();
      refresh();
      return true;
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return false;
    }
  };
  const selection = selected.current;
  const phone = resolve(selection.id);
  const canVerify = () => canRun() && selected.current === selection && !!resolve(selection.id);
  const verify = async (operation: (phone: PhoneNumberResource) => Promise<unknown>, canContinue: () => boolean) => {
    const isCurrent = () => canVerify() && canContinue();
    const currentPhone = isCurrent() ? resolve(selection.id) : undefined;
    if (!currentPhone) {
      return false;
    }
    try {
      await operation(currentPhone);
      return isCurrent();
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return false;
    }
  };
  const phones = getAvailablePhonesFromUser(user).map(phone => {
    const { iso } = parsePhoneString(phone.phoneNumber);
    return {
      id: phone.id,
      isVerified: phone.verification.status === 'verified',
      flag: getFlagEmojiFromCountryIso(iso),
      formattedPhone: stringToFormattedPhoneString(phone.phoneNumber),
    };
  });
  const scopeKey = JSON.stringify([key, version]);
  return {
    scopeKey,
    canRun,
    hasUser: !!user,
    username: user?.username,
    hasAvailablePhones: phones.length > 0,
    phones,
    backupCodes: backups.current?.slice(),
    createPhone: async (phoneNumber, canContinue = () => true) => {
      const isCurrent = () => canRun() && canContinue();
      if (!isCurrent()) {
        return false;
      }
      try {
        const phone = await createPhoneNumber(phoneNumber, isCurrent);
        if (!phone || !isCurrent()) {
          return false;
        }
        created.current = phone;
        select(phone.id);
        return true;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
    selectUnverifiedPhone: id => {
      if (!canRun() || !getAvailablePhonesFromUser(clerk.user).some(phone => phone.id === id)) {
        return false;
      }
      select(id);
      return true;
    },
    enableVerifiedPhone: (id, canContinue) => {
      const phone = canRun() ? getAvailablePhonesFromUser(clerk.user).find(phone => phone.id === id) : undefined;
      return phone?.verification.status === 'verified' ? enablePhone(id, canContinue) : Promise.resolve(false);
    },
    verification: {
      scopeKey: JSON.stringify([scopeKey, selection.version, selection.id]),
      canRun: canVerify,
      phoneId: selection.id,
      phoneNumber: phone?.phoneNumber ?? '',
      prepare: (canContinue = () => true) => verify(phone => phone.prepareVerification(), canContinue),
      attempt: (code, canContinue = () => true) => verify(phone => phone.attemptVerification({ code }), canContinue),
      enableMfa: (canContinue = () => true) =>
        selection.id ? enablePhone(selection.id, () => canVerify() && canContinue()) : Promise.resolve(false),
    },
  };
};
