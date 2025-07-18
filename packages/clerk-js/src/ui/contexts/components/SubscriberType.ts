import type { CommercePayerType } from '@clerk/types';
import { createContext, useContext } from 'react';

const DEFAUlT = 'user';
export const SubscriberTypeContext = createContext<CommercePayerType | undefined>(DEFAUlT);

export const useSubscriberTypeContext = (): CommercePayerType => useContext(SubscriberTypeContext) || DEFAUlT;

export const useSubscriberTypeLocalizationRoot = () => {
  const subscriberType = useSubscriberTypeContext();
  return subscriberType === 'user' ? 'userProfile' : 'organizationProfile';
};
