import type { PhoneCodeChannelData } from '@clerk/shared/types';

import { useEnabledThirdPartyProviders } from '../../hooks';

export const useAlternativePhoneCodeCardModel = (phoneCodeProvider: PhoneCodeChannelData) => {
  const { providerToDisplayData, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const provider = phoneCodeProvider.name;
  const channel = phoneCodeProvider.channel;
  const strategyData = strategyToDisplayData[channel];
  return {
    provider,
    channel,
    iconUrl: providerToDisplayData[channel]?.iconUrl,
    hasProvider: Boolean(providerToDisplayData[channel]),
    name: strategyData?.name || channel || provider,
  };
};
