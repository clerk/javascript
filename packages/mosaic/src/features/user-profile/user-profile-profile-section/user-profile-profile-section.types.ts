import type { ReactNode } from 'react';

import type { UserProfileManagedBy } from '../user-profile-managed-by';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';
import type { UserProfilePictureController } from './user-profile-picture.controller';

/** One name attribute as the instance configures it. Supplied from `userSettings.attributes.first_name` and `last_name`. */
export interface UserProfileNameAttribute {
  /** @default true */
  enabled?: boolean;
  /** @default false */
  required?: boolean;
}

export interface UserProfileProfileSectionViewProps {
  name: string;
  imageUrl?: string;
  /**
   * Whether `imageUrl` is a picture the user uploaded. Clerk's image service always returns a URL —
   * a generated initials avatar when none was uploaded — so the row cannot tell the two apart from
   * `imageUrl` alone. Supplied from `user.hasImage`.
   */
  hasImage?: boolean;
  showName: boolean;
  nameManagedBy?: UserProfileManagedBy;
  nameAction?: ReactNode;
  showUsername: boolean;
  username: string;
  usernameAction?: ReactNode;
  picture: UserProfilePictureController;
}

export type UserProfileProfileSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      name: string;
      /** Passed alongside `name`, which cannot be split back into its two halves. */
      firstName: string;
      lastName: string;
      firstNameAttribute: UserProfileNameAttribute;
      lastNameAttribute: UserProfileNameAttribute;
      nameManagedBy?: UserProfileManagedBy;
      imageUrl: string;
      hasImage: boolean;
      onProfilePictureChange: (file: File) => Promise<void>;
      onRemoveProfilePicture?: () => Promise<void>;
      onSubmitName?: (value: UserProfileEditNameValue) => Promise<void>;
      showUsername: boolean;
      username: string;
      usernameRequired: boolean;
      onSubmitUsername?: (username: string) => Promise<void>;
    };

export type ReadyProfileSectionModel = Extract<UserProfileProfileSectionModel, { status: 'ready' }>;
