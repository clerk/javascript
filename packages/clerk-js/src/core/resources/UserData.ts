import type { UserData as IUserData, UserDataJSON } from '@clerk/types';

export class UserData implements IUserData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  hasImage?: boolean;

  constructor(data: UserDataJSON | null) {
    this.fromJSON(data);
  }

  protected fromJSON(data: UserDataJSON | null): this {
    if (data) {
      this.firstName = data.first_name;
      this.lastName = data.last_name;
      this.imageUrl = data.image_url;
      this.hasImage = data.has_image;
    }

    return this;
  }

  public toJSON(): UserDataJSON {
    return {
      first_name: this.firstName,
      last_name: this.lastName,
      image_url: this.imageUrl,
      has_image: this.hasImage,
    };
  }
}
