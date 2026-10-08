import { useUser } from '@clerk/shared/react';

import { useEnvironment, useUserProfileContext } from '@/ui/contexts';

import { isAttributeAvailable } from './utils';

export const useAccountUsernameModel = () => {
  const { attributes } = useEnvironment().userSettings;
  const { immutableAttributes } = useUserProfileContext();
  return {
    available: isAttributeAvailable(attributes.username),
    isImmutable: immutableAttributes.has('username'),
  };
};

export const useAccountEmailsModel = () => {
  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation, immutableAttributes } = useUserProfileContext();
  const isImmutable = immutableAttributes.has('email_address');
  return {
    available: isAttributeAvailable(attributes.email_address),
    shouldAllowCreation: shouldAllowIdentificationCreation && !isImmutable,
    shouldAllowDeletion: !isImmutable,
  };
};

export const useAccountPhoneModel = () => {
  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation, immutableAttributes } = useUserProfileContext();
  const isImmutable = immutableAttributes.has('phone_number');
  return {
    available: isAttributeAvailable(attributes.phone_number),
    shouldAllowCreation: shouldAllowIdentificationCreation && !isImmutable,
    shouldAllowDeletion: !isImmutable,
  };
};

export const useAccountConnectedAccountsModel = () => {
  const { social } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();
  return {
    available: !!social && Object.values(social).filter(provider => provider.enabled).length > 0,
    shouldAllowCreation: shouldAllowIdentificationCreation,
  };
};

export const useAccountEnterpriseAccountsModel = () => {
  const { enterpriseSSO } = useEnvironment().userSettings;
  const { user } = useUser();
  return { available: !!user && enterpriseSSO.enabled };
};

export const useAccountWeb3Model = () => {
  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();
  return {
    available: !!attributes.web3_wallet?.enabled,
    shouldAllowCreation: shouldAllowIdentificationCreation,
  };
};
