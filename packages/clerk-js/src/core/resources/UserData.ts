import type { UserData as IUserData, UserDataJSON, UserDataJSONSnapshot } from '@clerk/shared/types';

export class UserData implements IUserData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  hasImage?: boolean;

  constructor(data: UserDataJSON | UserDataJSONSnapshot | null) {
    this.fromJSON(data);
  }

  protected fromJSON(data: UserDataJSON | UserDataJSONSnapshot | null): this {
    if (data) {
      this.firstName = data.first_name;
      this.lastName = data.last_name;
      this.imageUrl = data.image_url ?? undefined;
      this.hasImage = data.has_image ?? undefined;
    }

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
