import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { IdentificationLinkJSON } from './JSON';
import type { IdentificationLinkProps } from './Props';

interface IdentificationLinkPayload extends IdentificationLinkProps {}

export interface IdentificationLink extends IdentificationLinkPayload {}

export class IdentificationLink {
  static attributes = ['id', 'type'];

  static defaults = {};

  constructor(data: Partial<IdentificationLinkPayload> = {}) {
    Object.assign(this, IdentificationLink.defaults, data);
  }

  static fromJSON(data: IdentificationLinkJSON): IdentificationLink {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, IdentificationLink.attributes);
    return new IdentificationLink(filtered as IdentificationLinkPayload);
  }
}
