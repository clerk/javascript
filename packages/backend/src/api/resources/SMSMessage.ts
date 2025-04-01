import type { SMSMessageJSON } from './JSON';

export class SMSMessage {
  constructor(
    readonly id: string,
    readonly fromPhoneNumber: string,
    readonly toPhoneNumber: string,
    readonly message: string,
    readonly status: string,
    readonly phoneNumberId: string | null,
    readonly data?: Record<string, any> | null,
  ) {}

  static fromJSON(data: SMSMessageJSON): SMSMessage {
    return new SMSMessage(
      data.id,
      data.from_phone_number,
      data.to_phone_number,
      data.message,
      data.status,
      data.phone_number_id,
      data.data,
    );
  }
}
