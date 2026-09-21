import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';
import type { AttributeData, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { toSaveResult } from '../../../utils/save-result';
import type { ReverificationProps } from '../../reverification';
import { useReverificationWithState } from '../../reverification';
import type {
  UserProfileEmail,
  UserProfileNameAttribute,
  UserProfilePhone,
} from './user-profile-account-section.types';
import { isAttributeAvailable } from './user-profile-account-section.utils';
import type { UserProfileAccountSectionViewProps } from './user-profile-account-section.view';
import type { UserProfileEditNameField } from './user-profile-edit-name.dialog';
import type { UserProfileEditUsernameField } from './user-profile-edit-username.dialog';

type UserProfileAccountSectionData = Pick<
  UserProfileAccountSectionViewProps,
  | 'name'
  | 'imageUrl'
  | 'hasImage'
  | 'firstName'
  | 'lastName'
  | 'firstNameAttribute'
  | 'lastNameAttribute'
  | 'username'
  | 'emails'
  | 'phones'
  | 'onProfilePictureChange'
  | 'onRemoveProfilePicture'
  | 'onSubmitName'
  | 'onSubmitUsername'
>;

export type UserProfileAccountSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (UserProfileAccountSectionData & { status: 'ready'; reverification: ReverificationProps });

const NAME_FIELDS: readonly UserProfileEditNameField[] = ['firstName', 'lastName'];
const USERNAME_FIELDS: readonly UserProfileEditUsernameField[] = ['username'];

function toNameAttribute(attribute: AttributeData | undefined): UserProfileNameAttribute {
  return { enabled: attribute?.enabled ?? false, required: attribute?.required ?? false };
}

function primaryFirst<T extends { id: string }>(items: T[], primaryId: string | null): T[] {
  return [...items.filter(item => item.id === primaryId), ...items.filter(item => item.id !== primaryId)];
}

function toEmails(user: UserResource): UserProfileEmail[] {
  return primaryFirst(user.emailAddresses, user.primaryEmailAddressId).map(email => ({
    id: email.id,
    value: email.emailAddress,
    isDefault: email.id === user.primaryEmailAddressId,
    isVerified: email.verification.status === 'verified',
  }));
}

function toPhones(user: UserResource): UserProfilePhone[] {
  return primaryFirst(user.phoneNumbers, user.primaryPhoneNumberId).map(phone => ({
    id: phone.id,
    value: phone.phoneNumber,
    isDefault: phone.id === user.primaryPhoneNumberId,
    isVerified: phone.verification.status === 'verified',
  }));
}

export function useUserProfileAccountSectionModel(): UserProfileAccountSectionModel {
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const [updateUsername, reverification] = useReverificationWithState((username: string) => user?.update({ username }));

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const { attributes } = environment.userSettings;
  const usernameAttribute = attributes.username;
  const usernameImmutable = Boolean(usernameAttribute?.immutable);
  const showUsername = isAttributeAvailable(usernameAttribute) && !(usernameImmutable && !user.username);
  const nameReadOnly = user.enterpriseAccounts.some(account => account.active);

  return {
    status: 'ready',
    reverification,
    name: getFullName(user),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    firstNameAttribute: toNameAttribute(attributes.first_name),
    lastNameAttribute: toNameAttribute(attributes.last_name),
    imageUrl: user.imageUrl,
    hasImage: user.hasImage,
    username: showUsername ? (user.username ?? '') : undefined,
    emails: toEmails(user),
    phones: toPhones(user),
    onProfilePictureChange: file => toSaveResult(() => user.setProfileImage({ file })),
    onRemoveProfilePicture: user.hasImage ? () => toSaveResult(() => user.setProfileImage({ file: null })) : undefined,
    onSubmitName: nameReadOnly
      ? undefined
      : value => toSaveResult(() => user.update({ firstName: value.firstName, lastName: value.lastName }), NAME_FIELDS),
    onSubmitUsername:
      showUsername && !usernameImmutable
        ? username => toSaveResult(() => updateUsername(username), USERNAME_FIELDS)
        : undefined,
  };
}
