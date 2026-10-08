import type { PhoneCodeChannelData } from '@clerk/shared/types';

import { useEnabledThirdPartyProviders } from '../../hooks';

export const useSignUpStartAlternativePhoneCodePhoneNumberCardModel = (phoneCodeProvider: PhoneCodeChannelData) => {
  const { providerToDisplayData, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const provider = phoneCodeProvider.name;
  const channel = phoneCodeProvider.channel;
  const strategyData = strategyToDisplayData[channel];

  return {
    provider,
    channel,
    hasProviderDisplayData: Boolean(providerToDisplayData[channel]),
    providerIconUrl: providerToDisplayData[channel]?.iconUrl,
    displayName: strategyData?.name || channel || provider,
  };
};
