import type { AlternativePhoneCodeStrategy } from './strategies';

export interface AlternativePhoneCodeProviderData {
  provider: AlternativePhoneCodeProvider;
  strategy: AlternativePhoneCodeStrategy;
  name: string;
}

export type WhatsAppProvider = 'whatsapp';

export type AlternativePhoneCodeProvider = WhatsAppProvider;
