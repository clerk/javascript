export interface PhoneCodeChannelData {
  channel: PhoneCodeChannel;
  name: string;
}

/** @inline */
export type PhoneCodeSMSChannel = 'sms';
/** @inline */
export type PhoneCodeWhatsAppChannel = 'whatsapp';

/** @inline */
export type PhoneCodeChannel = PhoneCodeSMSChannel | PhoneCodeWhatsAppChannel;

/** @inline */
export type PhoneCodeProvider = PhoneCodeChannel;
