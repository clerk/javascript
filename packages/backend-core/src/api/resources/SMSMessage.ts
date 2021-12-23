import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { SMSMessageJSON } from './JSON';
import type { SMSMessageProps } from './Props';

interface SMSMessagePayload extends SMSMessageProps {};

export interface SMSMessage extends SMSMessagePayload {};

export class SMSMessage {
  static attributes = ['id', 'fromPhoneNumber', 'toPhoneNumber',
    'phoneNumberId', 'message', 'status'];

  static defaults = {};

  constructor(data: Partial<SMSMessagePayload> = {}) {
    Object.assign(this, SMSMessage.defaults, data);
  }

  static fromJSON(data: SMSMessageJSON): SMSMessage {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, SMSMessage.attributes);
    return new SMSMessage(filtered as SMSMessagePayload);
  }
}
