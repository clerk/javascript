import { deprecatedProperty } from '@clerk/shared';
import type { PublicUserData } from '@clerk/types';
import type { PublicUserDataJSON } from '@clerk/types';

export class OrganizationPublicUserData implements PublicUserData {
  firstName!: string | null;
  lastName!: string | null;
  /**
   * @deprecated  Use `imageUrl` instead.
   */
  profileImageUrl!: string;
  imageUrl!: string;
  hasImage!: boolean;
  identifier!: string;
  userId?: string;

  constructor(data: PublicUserDataJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: PublicUserDataJSON | null): this {
    if (data) {
      this.firstName = data.first_name;
      this.lastName = data.last_name;
      this.profileImageUrl = data.profile_image_url;
      this.imageUrl = data.image_url;
      this.hasImage = data.has_image;
      this.identifier = data.identifier;
      this.userId = data.user_id;
    }

    return this;
  }
}

deprecatedProperty(OrganizationPublicUserData, 'profileImageUrl', 'Use `imageUrl` instead.');
