import type { UserProfilePhone } from '@clerk/mosaic/features/user-profile/user-profile-contact.types';
import { useUserProfilePhoneSectionController } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section.controller';
import type { UserProfilePhoneSectionViewProps } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section.types';
import { useState } from 'react';

import { createUserProfileAddPhoneFixture } from './user-profile-add-phone';

export const examplePhones: UserProfilePhone[] = [
  { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  { id: 'phone_2', value: '+18015550100', isDefault: false, isVerified: true },
];

export interface UserProfilePhonesFixtureOptions {
  initialPhones?: UserProfilePhone[];
  fail?: 'create' | 'verify';
  removalState?: 'pending' | 'error';
}

export function useUserProfilePhonesFixture({
  initialPhones = examplePhones,
  fail,
  removalState,
}: UserProfilePhonesFixtureOptions = {}): UserProfilePhoneSectionViewProps {
  const [phones, setPhones] = useState(initialPhones);
  const [removalFailed, setRemovalFailed] = useState(false);
  const flow = createUserProfileAddPhoneFixture({
    fail,
    onCreated: (id, value) => setPhones(current => [...current, { id, value, isDefault: false, isVerified: false }]),
    onVerified: id =>
      setPhones(current => current.map(phone => (phone.id === id ? { ...phone, isVerified: true } : phone))),
  });

  return useUserProfilePhoneSectionController({
    phones,
    ...flow,
    onSetPrimaryPhone: id => {
      setPhones(current => current.map(phone => ({ ...phone, isDefault: phone.id === id })));
      return Promise.resolve();
    },
    onRemovePhone: async id => {
      if (removalState === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      if (removalState === 'error' && !removalFailed) {
        setRemovalFailed(true);
        throw new Error('Unable to remove this phone number. Try again.');
      }
      setPhones(current => current.filter(phone => phone.id !== id));
    },
  });
}
