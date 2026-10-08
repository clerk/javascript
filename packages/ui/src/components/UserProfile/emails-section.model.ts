import { useReverification, useUser } from '@clerk/shared/react';

import { sortIdentificationBasedOnVerification } from './utils';

export type EmailsSectionProps = {
  shouldAllowCreation?: boolean;
  shouldAllowDeletion?: boolean;
};

export const useEmailsSectionModel = () => {
  const { user } = useUser();
  const primaryEmailAddressId = user?.primaryEmailAddressId;

  return {
    emails: sortIdentificationBasedOnVerification(user?.emailAddresses, primaryEmailAddressId).map(email => ({
      id: email.id,
      emailAddress: email.emailAddress,
      isPrimary: primaryEmailAddressId === email.id,
      isVerified: email.verification.status === 'verified',
    })),
  };
};

export const useEmailMenuModel = (emailId: string, isVerified: boolean) => {
  const { user } = useUser();
  const setPrimary = useReverification(() => user?.update({ primaryEmailAddressId: emailId }));

  return {
    isPrimary: user?.primaryEmailAddressId === emailId,
    isVerified,
    setPrimary,
  };
};
