import { useSuspenseProfile } from '@clerk/loom/react';

import { toCountryIso } from '../../components/phone-input';
import { useReverificationFlow } from '../../features/reverification';
import type { UserProfilePhoneVerifier } from '../../features/user-profile/user-profile-contact.types';
import {
  canAddIdentifications,
  toContactAccess,
  toContacts,
} from '../../features/user-profile/user-profile-contact.utils';
import type { UserProfileAddPhoneField } from '../../features/user-profile/user-profile-phone-section/user-profile-add-phone.controller';
import type { PhoneSectionState } from '../../features/user-profile/user-profile-phone-section/user-profile-phone-section';
import { save } from '../../utils/errors';

const ADD_PHONE_FIELDS: readonly UserProfileAddPhoneField[] = ['phoneNumber', 'code'];

export function useLoomProfilePhonesModel(): PhoneSectionState | null {
  const { user, settings, actions } = useSuspenseProfile();
  const [removePhone, removeReverification] = useReverificationFlow((id: string) => {
    const remove = actions.phone.remove;
    if (!remove) {
      throw new Error('Phone removal unavailable.');
    }
    return remove(id);
  });
  const [setPrimaryPhone, setPrimaryReverification] = useReverificationFlow((id: string) => {
    const setPrimary = actions.phone.setPrimary;
    if (!setPrimary) {
      throw new Error('Phone selection unavailable.');
    }
    return setPrimary(id);
  });
  const attribute = settings.phoneNumber;
  if (!attribute) {
    return null;
  }
  if (!user.phoneNumbers) {
    throw new Error('Loom phone data is unavailable.');
  }
  const eligibility = toContactAccess(
    {
      ...attribute,
      used_for_first_factor: attribute.usedForFirstFactor,
      used_for_second_factor: attribute.usedForSecondFactor,
    },
    user.phoneNumbers.length,
    canAddIdentifications(user, settings.enterpriseSsoEnabled),
  );
  if (!eligibility.show) {
    return null;
  }
  const phones = toContacts(
    user.phoneNumbers.map(phone => ({
      ...phone,
      verification: {
        status: phone.verification?.status ?? null,
        expireAt: phone.verification?.expireAt == null ? null : new Date(phone.verification.expireAt),
      },
    })),
    user.primaryPhoneNumberId ?? null,
    phone => phone.phoneNumber,
  );
  if (!actions.phone.available || !actions.phone.setPrimary) {
    return { kind: 'snapshot', phones, eligibility };
  }
  const phoneVerifier = (id: string): UserProfilePhoneVerifier => {
    const verifier = actions.phone.verifier(id);
    return {
      sendCode: () => save(verifier.sendCode),
      verifyCode: code => save(() => verifier.verifyCode(code), ADD_PHONE_FIELDS),
    };
  };
  return {
    kind: 'interactive',
    model: {
      status: 'ready',
      userId: user.id,
      defaultPhoneCountry: toCountryIso(actions.phone.defaultCountry),
      phones,
      onCreatePhone:
        eligibility.canCreate && actions.phone.create
          ? async number => {
              const request = actions.phone.create?.(number);
              if (!request) {
                throw new Error('Phone creation unavailable.');
              }
              await save(() => request, ADD_PHONE_FIELDS);
              const verifier = await request;
              return {
                sendCode: () => save(verifier.sendCode),
                verifyCode: code => save(() => verifier.verifyCode(code), ADD_PHONE_FIELDS),
              };
            }
          : undefined,
      getPhoneVerifier: phoneVerifier,
      onSetPrimaryPhone: id => save(() => setPrimaryPhone(id)),
      onRemovePhone: eligibility.canRemove && actions.phone.remove ? id => save(() => removePhone(id)) : undefined,
      removeReverification,
      setPrimaryReverification,
    },
  };
}
