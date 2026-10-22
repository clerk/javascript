import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import type { AttributeData, UserResource } from '@clerk/shared/types';

import { isAttributeAvailable } from '../user-profile.utils';
import type { UserProfileManagedBy } from '../user-profile-managed-by';
import { type UserProfileActionContext, useUserProfileUserModel } from '../user-profile-user.model';
import type { UserProfileEditNameField } from './user-profile-edit-name.dialog';
import type { UserProfileEditUsernameField } from './user-profile-edit-username.dialog';
import type { UserProfileNameAttribute, UserProfileProfileSectionModel } from './user-profile-profile-section.types';

const NAME_FIELDS: readonly UserProfileEditNameField[] = ['firstName', 'lastName'];
const USERNAME_FIELDS: readonly UserProfileEditUsernameField[] = ['username'];

function toManagedBy(account: ProfileUser['enterpriseAccounts'][number] | undefined): UserProfileManagedBy | undefined {
  if (!account) {
    return undefined;
  }
  const connection = account.enterpriseConnection;
  return { name: connection?.name || account.provider.replace(/^(oauth_|saml_)/, '') };
}

function toNameAttribute(attribute: Pick<AttributeData, 'enabled' | 'required'> | undefined): UserProfileNameAttribute {
  return { enabled: attribute?.enabled ?? false, required: attribute?.required ?? false };
}

type ProfileUser = Pick<UserResource, 'id' | 'firstName' | 'lastName' | 'username' | 'imageUrl' | 'hasImage'> & {
  enterpriseAccounts: readonly { active: boolean; provider: string; enterpriseConnection: { name: string } | null }[];
};
type ProfileAttributes = {
  first_name?: Pick<AttributeData, 'enabled' | 'required'>;
  last_name?: Pick<AttributeData, 'enabled' | 'required'>;
  username?: Pick<
    AttributeData,
    'enabled' | 'required' | 'immutable' | 'used_for_first_factor' | 'used_for_second_factor'
  >;
};

export function projectProfileDetails(user: ProfileUser, attributes: ProfileAttributes) {
  const usernameImmutable = Boolean(attributes.username?.immutable);
  return {
    userId: user.id,
    name: getFullName(user),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    firstNameAttribute: toNameAttribute(attributes.first_name),
    lastNameAttribute: toNameAttribute(attributes.last_name),
    nameManagedBy: toManagedBy(user.enterpriseAccounts.find(account => account.active)),
    imageUrl: user.imageUrl,
    hasImage: user.hasImage,
    showUsername: isAttributeAvailable(attributes.username) && !(usernameImmutable && !user.username),
    username: user.username ?? '',
    usernameRequired: Boolean(attributes.username?.required),
    eligibility: {
      canEditName: !user.enterpriseAccounts.some(account => account.active),
      canEditUsername: isAttributeAvailable(attributes.username) && !usernameImmutable,
      canChangePicture: true,
      canRemovePicture: user.hasImage,
    },
  };
}

export function useUserProfileProfileActions(context?: UserProfileActionContext) {
  const model = useUserProfileUserModel(context);
  if (model.status !== 'ready') {
    return model;
  }
  const { user, environment, saveAsUser } = model;
  const { attributes, usernameSettings } = environment.userSettings;
  return {
    status: 'ready' as const,
    onProfilePictureChange: (file: File) => saveAsUser(current => current.setProfileImage({ file })),
    onRemoveProfilePicture: user.hasImage
      ? () => saveAsUser(current => current.setProfileImage({ file: null }))
      : undefined,
    onSubmitName: user.enterpriseAccounts.some(account => account.active)
      ? undefined
      : (value: { firstName: string; lastName: string }) =>
          saveAsUser(current => {
            if (current.enterpriseAccounts.some(account => account.active)) {
              throw new Error('Name is managed by enterprise SSO.');
            }
            return current.update(value);
          }, NAME_FIELDS),
    onSubmitUsername:
      isAttributeAvailable(attributes.username) && !attributes.username?.immutable
        ? (username: string) =>
            saveAsUser(current => current.update({ username }), USERNAME_FIELDS, {
              min_length: usernameSettings.min_length,
              max_length: usernameSettings.max_length,
            })
        : undefined,
  };
}

export function useUserProfileProfileSectionModel(): UserProfileProfileSectionModel {
  const model = useUserProfileUserModel();
  const actions = useUserProfileProfileActions();
  if (model.status !== 'ready' || actions.status !== 'ready') {
    return { status: model.status === 'hidden' ? 'hidden' : 'loading' };
  }
  return { ...projectProfileDetails(model.user, model.environment.userSettings.attributes), ...actions };
}
