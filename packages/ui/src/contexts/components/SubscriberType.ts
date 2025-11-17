import type { ForPayerType } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

const DEFAUlT = 'user';
export const SubscriberTypeContext = createContext<ForPayerType | undefined>(DEFAUlT);

export const useSubscriberTypeContext = (): ForPayerType => useContext(SubscriberTypeContext) || DEFAUlT;

export const useSubscriberTypeLocalizationRoot = () => {
  const subscriberType = useSubscriberTypeContext();
  return subscriberType === 'user' ? 'userProfile' : 'organizationProfile';
};
