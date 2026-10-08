import { useReverification, useUser } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';

import { sortIdentificationBasedOnVerification } from './utils';

export type PhoneSectionProps = {
  shouldAllowCreation?: boolean;
  shouldAllowDeletion?: boolean;
};

export const usePhoneSectionModel = () => {
  const { user } = useUser();
  const primaryPhoneNumberId = user?.primaryPhoneNumberId;

  return {
    phones: sortIdentificationBasedOnVerification(user?.phoneNumbers, primaryPhoneNumberId).map(phone => ({
      id: phone.id,
      phoneNumber: phone.phoneNumber,
      isPrimary: primaryPhoneNumberId === phone.id,
      isVerified: phone.verification.status === 'verified',
    })),
  };
};

export const usePhoneMenuModel = (phoneId: string, isVerified: boolean) => {
  const { user } = useUser();
  const setPrimary = useReverification((user: UserResource) => user.update({ primaryPhoneNumberId: phoneId }));

  if (!user) {
    return { status: 'hidden' as const };
  }

  return {
    status: 'ready' as const,
    isPrimary: user.primaryPhoneNumberId === phoneId,
    isVerified,
    setPrimary: () => setPrimary(user),
  };
};
