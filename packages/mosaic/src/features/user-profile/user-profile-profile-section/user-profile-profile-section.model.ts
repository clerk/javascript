import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import type { AttributeData, EnterpriseAccountResource } from '@clerk/shared/types';

import { isAttributeAvailable } from '../user-profile.utils';
import type { UserProfileManagedBy } from '../user-profile-managed-by';
import { useUserProfileUserModel } from '../user-profile-user.model';
import type { UserProfileEditNameField } from './user-profile-edit-name.dialog';
import type { UserProfileEditUsernameField } from './user-profile-edit-username.dialog';
import type { UserProfileNameAttribute, UserProfileProfileSectionModel } from './user-profile-profile-section.types';

const NAME_FIELDS: readonly UserProfileEditNameField[] = ['firstName', 'lastName'];
const USERNAME_FIELDS: readonly UserProfileEditUsernameField[] = ['username'];

function toManagedBy(account: EnterpriseAccountResource | undefined): UserProfileManagedBy | undefined {
  if (!account) {
    return undefined;
  }
  const connection = account.enterpriseConnection;
  return { name: connection?.name || account.provider.replace(/^(oauth_|saml_)/, '') };
}

function toNameAttribute(attribute: AttributeData | undefined): UserProfileNameAttribute {
  return { enabled: attribute?.enabled ?? false, required: attribute?.required ?? false };
}

export function useUserProfileProfileSectionModel(): UserProfileProfileSectionModel {
  const model = useUserProfileUserModel();
  if (model.status !== 'ready') {
    return model;
  }

  const { user, environment, saveAsUser } = model;
  const { attributes, usernameSettings } = environment.userSettings;
  const usernameImmutable = Boolean(attributes.username?.immutable);
  const nameManagedBy = toManagedBy(user.enterpriseAccounts.find(account => account.active));

  return {
    status: 'ready',
    userId: user.id,
    name: getFullName(user),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    firstNameAttribute: toNameAttribute(attributes.first_name),
    lastNameAttribute: toNameAttribute(attributes.last_name),
    nameManagedBy,
    imageUrl: user.imageUrl,
    hasImage: user.hasImage,
    onProfilePictureChange: file => saveAsUser(current => current.setProfileImage({ file })),
    onRemoveProfilePicture: user.hasImage
      ? () => saveAsUser(current => current.setProfileImage({ file: null }))
      : undefined,
    onSubmitName: nameManagedBy
      ? undefined
      : value =>
          saveAsUser(current => current.update({ firstName: value.firstName, lastName: value.lastName }), NAME_FIELDS),
    showUsername: isAttributeAvailable(attributes.username) && !(usernameImmutable && !user.username),
    username: user.username ?? '',
    usernameRequired: Boolean(attributes.username?.required),
    onSubmitUsername: usernameImmutable
      ? undefined
      : username =>
          saveAsUser(current => current.update({ username }), USERNAME_FIELDS, {
            min_length: usernameSettings.min_length,
            max_length: usernameSettings.max_length,
          }),
  };
}
