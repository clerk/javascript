import type { IdentificationLinkJSON, IdentificationLinkJSONSnapshot, IdentificationLinkResource } from '@clerk/types';

import { BaseResource } from './Base';
import { parseJSON, serializeToJSON } from './parser';

export class IdentificationLink extends BaseResource implements IdentificationLinkResource {
  id!: string;
  type!: string;

  constructor(data: IdentificationLinkJSON | IdentificationLinkJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: IdentificationLinkJSON | IdentificationLinkJSONSnapshot | null): this {
    Object.assign(this, parseJSON<IdentificationLinkResource>(data));
    return this;
  }

  public __internal_toSnapshot(): IdentificationLinkJSONSnapshot {
    return {
      object: 'identification_link',
      ...serializeToJSON(this),
    } as IdentificationLinkJSONSnapshot;
  }
}
