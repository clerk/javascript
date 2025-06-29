import type { UserData as IUserData, UserDataJSON, UserDataJSONSnapshot } from '@clerk/types';

import { parseJSON } from './parser';

export class UserData implements IUserData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  hasImage?: boolean;

  constructor(data: UserDataJSON | UserDataJSONSnapshot | null) {
    this.fromJSON(data);
  }

  protected fromJSON(data: UserDataJSON | UserDataJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    Object.assign(this, parseJSON<IUserData>(data));
    return this;
  }

  public __internal_toSnapshot(): UserDataJSONSnapshot {
    return {
      first_name: this.firstName,
      last_name: this.lastName,
      image_url: this.imageUrl || null,
      has_image: this.hasImage || null,
    };
  }
}
