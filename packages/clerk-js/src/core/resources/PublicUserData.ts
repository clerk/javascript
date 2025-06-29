import type { PublicUserData as IPublicUserData, PublicUserDataJSON, PublicUserDataJSONSnapshot } from '@clerk/types';

import { parseJSON, serializeToJSON } from './parser';

export class PublicUserData implements IPublicUserData {
  firstName!: string | null;
  lastName!: string | null;
  imageUrl!: string;
  hasImage!: boolean;
  identifier!: string;
  userId?: string;

  constructor(data: PublicUserDataJSON | PublicUserDataJSONSnapshot) {
    this.fromJSON(data);
  }

  protected fromJSON(data: PublicUserDataJSON | PublicUserDataJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    Object.assign(this, parseJSON<IPublicUserData>(data));
    return this;
  }

  public __internal_toSnapshot(): PublicUserDataJSONSnapshot {
    return serializeToJSON(this) as PublicUserDataJSONSnapshot;
  }
}
