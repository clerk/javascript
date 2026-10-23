import { useClerk } from '@clerk/shared/react';
import type { PhoneNumberResource, UserResource } from '@clerk/shared/types';

import { toCountryIso } from '../../../components/phone-input';
import { save } from '../../../utils/errors';
import { useReverificationFlow } from '../../reverification';
import type { UserProfilePhoneVerifier } from '../user-profile-contact.types';
import { byId, canAddIdentifications, toContactAccess, toContacts } from '../user-profile-contact.utils';
import { useUserProfileUserModel } from '../user-profile-user.model';
import type { UserProfileAddPhoneField } from './user-profile-add-phone.controller';
import type { UserProfilePhoneSectionModel } from './user-profile-phone-section.types';

const ADD_PHONE_FIELDS: readonly UserProfileAddPhoneField[] = ['phoneNumber', 'code'];

function toPhoneVerifier(currentPhone: () => PhoneNumberResource): UserProfilePhoneVerifier {
  return {
    sendCode: () =>
      save(async () => {
        await currentPhone().prepareVerification();
        currentPhone();
      }),
    verifyCode: code => save(() => currentPhone().attemptVerification({ code }), ADD_PHONE_FIELDS),
  };
}

export function useUserProfilePhoneSectionModel(): UserProfilePhoneSectionModel {
  const clerk = useClerk();
  const model = useUserProfileUserModel();
  const [removePhone, removeReverification] = useReverificationFlow((user: UserResource, id: string) =>
    byId(user.phoneNumbers, id, 'phone number').destroy(),
  );
  const [setPrimaryPhone, setPrimaryReverification] = useReverificationFlow((user: UserResource, id: string) =>
    user.update({ primaryPhoneNumberId: id }),
  );
  if (model.status !== 'ready') {
    return model;
  }

  const { user, environment, currentUser, saveAsUser } = model;
  const { attributes, enterpriseSSO } = environment.userSettings;
  const access = toContactAccess(
    attributes.phone_number,
    user.phoneNumbers.length,
    canAddIdentifications(user, enterpriseSSO.enabled),
  );

  if (!access.show) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    userId: user.id,
    phones: toContacts(user.phoneNumbers, user.primaryPhoneNumberId, phone => phone.phoneNumber),
    defaultPhoneCountry: toCountryIso(clerk.__internal_country),
    onCreatePhone: access.canCreate
      ? async phoneNumber => {
          const request = currentUser().createPhoneNumber({ phoneNumber });
          await save(() => request, ADD_PHONE_FIELDS);
          currentUser();
          const phone = await request;
          return toPhoneVerifier(() => byId(currentUser().phoneNumbers, phone.id, 'phone number'));
        }
      : undefined,
    getPhoneVerifier: id => toPhoneVerifier(() => byId(currentUser().phoneNumbers, id, 'phone number')),
    onSetPrimaryPhone: id => saveAsUser(current => setPrimaryPhone(current, id)),
    onRemovePhone: access.canRemove ? id => saveAsUser(current => removePhone(current, id)) : undefined,
    removeReverification,
    setPrimaryReverification,
  };
}
