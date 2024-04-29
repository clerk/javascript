import { deprecatedProperty } from '@clerk/shared/deprecated';
import type { UserData as IUserData } from '@clerk/types';
import type { UserDataJSON } from '@clerk/types';

export class UserData implements IUserData {
  firstName?: string;
  lastName?: string;
  /**
   * @deprecated  Use `imageUrl` instead.
   */
  profileImageUrl?: string;
  imageUrl?: string;
  hasImage?: boolean;

  constructor(data: UserDataJSON | null) {
    this.fromJSON(data);
  }

  protected fromJSON(data: UserDataJSON | null): this {
    if (data) {
      this.firstName = data.first_name;
      this.lastName = data.last_name;
      this.profileImageUrl = data.profile_image_url;
      this.imageUrl = data.image_url;
      this.hasImage = data.has_image;
    }

    return this;
  }
}

deprecatedProperty(UserData, 'profileImageUrl', 'Use `imageUrl` instead.');
