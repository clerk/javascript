import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { EmailJSON } from './JSON';
import type { EmailProps } from './Props';

interface EmailPayload extends EmailProps {}

export interface Email extends EmailPayload {}

export class Email {
  static attributes = [
    'id',
    'fromEmailName',
    'toEmailAddress',
    'emailAddressId',
    'subject',
    'body',
    'status',
  ];

  static defaults = {};

  constructor(data: Partial<EmailPayload> = {}) {
    Object.assign(this, Email.defaults, data);
  }

  static fromJSON(data: EmailJSON): Email {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, Email.attributes);
    return new Email(filtered as EmailPayload);
  }
}
