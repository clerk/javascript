import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import type { AttributeData, UserResource } from '@clerk/shared/types';

import { save } from '../../../utils/errors';
import { useReverificationFlow } from '../../reverification';
import { isAttributeAvailable } from '../user-profile.utils';
import { toManagedBy } from '../user-profile-managed-by.model';
import { useUserProfileUserModel } from '../user-profile-user.model';
import type { UserProfileEditNameField } from './user-profile-edit-name.dialog';
import type { UserProfileEditUsernameField } from './user-profile-edit-username.dialog';
import type { UserProfileNameAttribute, UserProfileProfileSectionModel } from './user-profile-profile-section.types';

const NAME_FIELDS: readonly UserProfileEditNameField[] = ['firstName', 'lastName'];
const USERNAME_FIELDS: readonly UserProfileEditUsernameField[] = ['username'];

function toNameAttribute(attribute: AttributeData | undefined): UserProfileNameAttribute {
  return { enabled: attribute?.enabled ?? false, required: attribute?.required ?? false };
}

export function useUserProfileProfileSectionModel(): UserProfileProfileSectionModel {
  const model = useUserProfileUserModel();
  const [updateUsername, usernameReverification] = useReverificationFlow(
    (currentUser: () => UserResource, username: string) => currentUser().update({ username }),
  );
  if (model.status !== 'ready') {
    return model;
  }

  const { user, environment, currentUser, saveAsUser } = model;
  const { attributes, usernameSettings } = environment.userSettings;
  const usernameImmutable = Boolean(attributes.username?.immutable);
  const showUsername = isAttributeAvailable(attributes.username) && !(usernameImmutable && !user.username);
  const managingAccount = user.enterpriseAccounts.find(account => account.active);
  const nameManagedBy = managingAccount ? toManagedBy(managingAccount) : undefined;

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
    showUsername,
    username: user.username ?? '',
    usernameRequired: Boolean(attributes.username?.required),
    onSubmitUsername:
      showUsername && !usernameImmutable
        ? username =>
            save(() => updateUsername(currentUser, username), USERNAME_FIELDS, {
              min_length: usernameSettings.min_length,
              max_length: usernameSettings.max_length,
            })
        : undefined,
    usernameReverification,
  };
}
