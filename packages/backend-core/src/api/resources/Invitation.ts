import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { InvitationJSON } from './JSON';
import type { InvitationProps } from './Props';

interface InvitationPayload extends InvitationProps {}

export interface Invitation extends InvitationPayload {}

export class Invitation {
  static attributes = ['id', 'emailAddress', 'createdAt', 'updatedAt'];

  static defaults = [];

  constructor(data: Partial<InvitationProps> = {}) {
    Object.assign(this, Invitation.defaults, data);
  }

  static fromJSON(data: InvitationJSON): Invitation {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, Invitation.attributes);
    return new Invitation(filtered as InvitationPayload);
  }
}
