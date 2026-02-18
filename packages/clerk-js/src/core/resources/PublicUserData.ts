import type {
  PublicUserData as IPublicUserData,
  PublicUserDataJSON,
  PublicUserDataJSONSnapshot,
} from '@clerk/shared/types';

export class PublicUserData implements IPublicUserData {
  firstName!: string | null;
  lastName!: string | null;
  imageUrl!: string;
  hasImage!: boolean;
  identifier!: string;
  userId?: string;
  username?: string;

  constructor(data: PublicUserDataJSON | PublicUserDataJSONSnapshot) {
    this.fromJSON(data);
  }

  protected fromJSON(data: PublicUserDataJSON | PublicUserDataJSONSnapshot | null): this {
    if (data) {
      this.firstName = data.first_name || null;
      this.lastName = data.last_name || null;
      this.imageUrl = data.image_url || '';
      this.hasImage = data.has_image || false;
      this.identifier = data.identifier || '';
      this.userId = data.user_id;
      this.username = data.username;
    }

    return this;
  }

  public __internal_toSnapshot(): PublicUserDataJSONSnapshot {
    return {
      first_name: this.firstName,
      last_name: this.lastName,
      image_url: this.imageUrl,
      has_image: this.hasImage,
      identifier: this.identifier,
      user_id: this.userId,
      username: this.username,
    };
  }
}
