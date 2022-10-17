import type { IdentificationLinkJSON } from './JSON';

export class IdentificationLink {
  constructor(readonly id: string, readonly type: string) {}

  static fromJSON(data: IdentificationLinkJSON): IdentificationLink {
    return new IdentificationLink(data.id, data.type);
  }
}
