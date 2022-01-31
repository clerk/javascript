import type { IdentificationLinkJSON } from '@clerk/types';

export class IdentificationLink {
  id: string;
  type: string;

  constructor(data: IdentificationLinkJSON) {
    this.id = data.id;
    this.type = data.type;
  }
}
