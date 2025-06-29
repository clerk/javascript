import type { IdentificationLinkJSON, IdentificationLinkJSONSnapshot, IdentificationLinkResource } from '@clerk/types';

import { BaseResource } from './Base';
import { parseJSON } from './parser';

export class IdentificationLink extends BaseResource implements IdentificationLinkResource {
  id!: string;
  type!: string;

  constructor(data: IdentificationLinkJSON | IdentificationLinkJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: IdentificationLinkJSON | IdentificationLinkJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    Object.assign(this, parseJSON<IdentificationLinkResource>(data));
    return this;
  }

  public __internal_toSnapshot(): IdentificationLinkJSONSnapshot {
    return {
      object: 'identification_link',
      id: this.id,
      type: this.type,
    };
  }
}
