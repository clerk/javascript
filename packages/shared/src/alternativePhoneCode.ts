import type { AlternativePhoneCodeProviderData } from '@clerk/types';

export const ALTERNATIVE_PHONE_CODE_PROVIDERS: AlternativePhoneCodeProviderData[] = [
  {
    provider: 'whatsapp',
    strategy: 'whatsapp_code',
    name: 'WhatsApp',
  },
];
