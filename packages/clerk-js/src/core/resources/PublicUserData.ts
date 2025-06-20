import type { PublicUserData as IPublicUserData, PublicUserDataJSON, PublicUserDataJSONSnapshot } from '@clerk/types';

import { parseJSON } from './parser';

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

    Object.assign(
      this,
      parseJSON<IPublicUserData>(data, {
        defaultValues: {
          firstName: null,
          lastName: null,
          imageUrl: '',
          hasImage: false,
          identifier: '',
        },
      }),
    );
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
    };
  }
}
