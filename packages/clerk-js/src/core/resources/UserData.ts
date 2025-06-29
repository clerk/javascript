import type { UserData as IUserData, UserDataJSON, UserDataJSONSnapshot } from '@clerk/types';

import { parseJSON, serializeToJSON } from './parser';

export class UserData implements IUserData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  hasImage?: boolean;

  constructor(data: UserDataJSON | UserDataJSONSnapshot | null) {
    this.fromJSON(data);
  }

  protected fromJSON(data: UserDataJSON | UserDataJSONSnapshot | null): this {
    Object.assign(this, parseJSON<IUserData>(data));
    return this;
  }

  public __internal_toSnapshot(): UserDataJSONSnapshot {
    return serializeToJSON(this) as UserDataJSONSnapshot;
  }
}
