import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useUser } from '@clerk/shared/react';
import type { AttributeData, EnterpriseAccountResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import type { MessageValues } from '../../../localization';
import { save, SaveError, UNEXPECTED_ERROR } from '../../../utils/errors';
import type { UserProfileManagedBy } from '../user-profile-managed-by';
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
  | 'allowMultipleAccounts'
  | 'name'
  | 'imageUrl'
  | 'hasImage'
  | 'firstName'
  | 'lastName'
  | 'firstNameAttribute'
  | 'lastNameAttribute'
  | 'nameManagedBy'
  | 'username'
  | 'usernameRequired'
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
  | (UserProfileAccountSectionData & { status: 'ready'; userId: string });

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
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const userId = user.id;

  const saveAsUser = <TField extends string = never>(
    run: (current: UserResource) => Promise<unknown>,
    fields: readonly TField[] = [],
    params?: MessageValues,
  ): Promise<void> =>
    save(
      () => {
        const current = clerk.user;
        if (!current || current.id !== userId) {
          throw new SaveError({ global: UNEXPECTED_ERROR });
        }
        return run(current);
      },
      fields,
      params,
    );

  const { attributes, usernameSettings } = environment.userSettings;
  const usernameAttribute = attributes.username;
  const usernameImmutable = Boolean(usernameAttribute?.immutable);
  const showUsername = isAttributeAvailable(usernameAttribute) && !(usernameImmutable && !user.username);
  const nameManagedBy = toManagedBy(user.enterpriseAccounts.find(account => account.active));
  const showEmails = isAttributeAvailable(attributes.email_address);
  const showPhones = isAttributeAvailable(attributes.phone_number);

  return {
    status: 'ready',
    userId,
    allowMultipleAccounts: true,
    name: getFullName(user),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    firstNameAttribute: toNameAttribute(attributes.first_name),
    lastNameAttribute: toNameAttribute(attributes.last_name),
    nameManagedBy,
    imageUrl: user.imageUrl,
    hasImage: user.hasImage,
    username: showUsername ? (user.username ?? '') : undefined,
    usernameRequired: Boolean(usernameAttribute?.required),
    emails: showEmails ? toEmails(user) : undefined,
    phones: showPhones ? toPhones(user) : undefined,
    onProfilePictureChange: file => saveAsUser(current => current.setProfileImage({ file })),
    onRemoveProfilePicture: user.hasImage
      ? () => saveAsUser(current => current.setProfileImage({ file: null }))
      : undefined,
    onSubmitName: nameManagedBy
      ? undefined
      : value =>
          saveAsUser(current => current.update({ firstName: value.firstName, lastName: value.lastName }), NAME_FIELDS),
    onSubmitUsername:
      showUsername && !usernameImmutable
        ? username =>
            saveAsUser(current => current.update({ username }), USERNAME_FIELDS, {
              min_length: usernameSettings.min_length,
              max_length: usernameSettings.max_length,
            })
        : undefined,
  };
}
