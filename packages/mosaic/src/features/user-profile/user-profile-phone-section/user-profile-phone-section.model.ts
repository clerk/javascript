import { useClerk } from '@clerk/shared/react';
import type { PhoneNumberResource, UserResource } from '@clerk/shared/types';

import { toCountryIso } from '../../../components/phone-input';
import { allowsIdentificationCreation } from '../../../utils/allows-identification-creation';
import { save } from '../../../utils/errors';
import { useReverificationFlow } from '../../reverification';
import type { UserProfilePhoneVerifier } from '../user-profile-contact.types';
import { byId, toContactAccess, toContacts } from '../user-profile-contact.utils';
import { useUserProfileUserModel } from '../user-profile-user.model';
import type { UserProfileAddPhoneField } from './user-profile-add-phone.controller';
import type { UserProfilePhoneSectionModel } from './user-profile-phone-section.types';

const ADD_PHONE_FIELDS: readonly UserProfileAddPhoneField[] = ['phoneNumber', 'code'];

function toPhoneVerifier(phone: PhoneNumberResource): UserProfilePhoneVerifier {
  return {
    sendCode: () => save(() => phone.prepareVerification()),
    verifyCode: code => save(() => phone.attemptVerification({ code }), ADD_PHONE_FIELDS),
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
  const [createPhone, createReverification] = useReverificationFlow(
    (currentUser: () => UserResource, phoneNumber: string) => currentUser().createPhoneNumber({ phoneNumber }),
  );
  if (model.status !== 'ready') {
    return model;
  }

  const { user, environment, currentUser, saveAsUser } = model;
  const { attributes, enterpriseSSO } = environment.userSettings;
  const access = toContactAccess(
    attributes.phone_number,
    user.phoneNumbers.length,
    allowsIdentificationCreation(user, enterpriseSSO),
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
          const request = createPhone(currentUser, phoneNumber);
          await save(() => request, ADD_PHONE_FIELDS);
          return toPhoneVerifier(await request);
        }
      : undefined,
    getPhoneVerifier: id => toPhoneVerifier(byId(user.phoneNumbers, id, 'phone number')),
    onSetPrimaryPhone: id => saveAsUser(current => setPrimaryPhone(current, id)),
    onRemovePhone: access.canRemove ? id => saveAsUser(current => removePhone(current, id)) : undefined,
    removeReverification,
    setPrimaryReverification,
    createReverification,
  };
}
