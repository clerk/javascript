import type {
  IdentificationLinkJSON,
  IdentificationLinkJSONSnapshot,
  IdentificationLinkResource,
} from '@clerk/shared/types';

import { BaseResource } from './Base';

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

    this.id = data.id;
    this.type = data.type;
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
