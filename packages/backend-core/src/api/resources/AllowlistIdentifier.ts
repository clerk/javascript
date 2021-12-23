import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { AllowlistIdentifierJSON } from './JSON';
import type { AllowlistIdentifierProps } from './Props';

interface AllowlistIdentifierPayload extends AllowlistIdentifierProps {}

export interface AllowlistIdentifier extends AllowlistIdentifierPayload {}

export class AllowlistIdentifier {
  static attributes = ['id', 'identifier', 'createdAt', 'updatedAt'];

  static defaults = [];

  constructor(data: Partial<AllowlistIdentifierProps> = {}) {
    Object.assign(this, AllowlistIdentifier.defaults, data);
  }

  static fromJSON(data: AllowlistIdentifierJSON): AllowlistIdentifier {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, AllowlistIdentifier.attributes);
    return new AllowlistIdentifier(filtered as AllowlistIdentifierPayload);
  }
}
