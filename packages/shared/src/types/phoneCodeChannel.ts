export interface PhoneCodeChannelData {
  channel: PhoneCodeChannel;
  name: string;
}

export type PhoneCodeSMSChannel = 'sms';
export type PhoneCodeWhatsAppChannel = 'whatsapp';

export type PhoneCodeChannel = PhoneCodeSMSChannel | PhoneCodeWhatsAppChannel;
export type PhoneCodeProvider = PhoneCodeChannel;
