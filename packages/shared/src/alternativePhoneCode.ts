import type { PhoneCodeChannelData } from '@clerk/types';

export const ALTERNATIVE_PHONE_CODE_PROVIDERS: PhoneCodeChannelData[] = [
  {
    channel: 'whatsapp',
    name: 'WhatsApp',
  },
];

export const getAlternativePhoneCodeProviderName = (channel?: string): PhoneCodeChannelData | null => {
  if (!channel) {
    return null;
  }
  return ALTERNATIVE_PHONE_CODE_PROVIDERS.find(p => p.channel === channel) || null;
};
