import type { IdentificationLinkJSON, IdentificationLinkResource } from '@clerk/types';

import { BaseResource } from './Base';

export class IdentificationLink extends BaseResource implements IdentificationLinkResource {
  id!: string;
  type!: string;

  constructor(data: IdentificationLinkJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: IdentificationLinkJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.type = data.type;
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
    };
  }
}
