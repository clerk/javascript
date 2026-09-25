import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';
import type { AttributeData, EmailAddressResource, EnterpriseAccountResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { save } from '../../../utils/form-error';
import type { UserProfileManagedBy } from '../user-profile-managed-by';
import type {
  UserProfileEmail,
  UserProfileNameAttribute,
  UserProfilePhone,
} from './user-profile-account-section.types';
import { isAttributeAvailable, sortByVerification } from './user-profile-account-section.utils';
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
  | 'emails'
  | 'phones'
  | 'onSetPrimaryEmail'
  | 'onRemoveEmail'
  | 'onProfilePictureChange'
  | 'onRemoveProfilePicture'
  | 'onSubmitName'
  | 'onSubmitUsername'
>;

export type UserProfileAccountSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (UserProfileAccountSectionData & { status: 'ready' });

const NAME_FIELDS: readonly UserProfileEditNameField[] = ['firstName', 'lastName'];
const USERNAME_FIELDS: readonly UserProfileEditUsernameField[] = ['username'];

function emailById(user: UserResource, id: string): EmailAddressResource {
  const email = user.emailAddresses.find(email => email.id === id);
  if (!email) {
    throw new Error(`No email address with id ${id}`);
  }
  return email;
}

function toManagedBy(account: EnterpriseAccountResource | undefined): UserProfileManagedBy | undefined {
  if (!account) {
    return undefined;
  }
  const connection = account.enterpriseConnection;
  return {
    name: connection?.name || account.provider.replace(/^(oauth_|saml_)/, ''),
    iconUrl: connection?.logoPublicUrl ?? undefined,
  };
}

function toNameAttribute(attribute: AttributeData | undefined): UserProfileNameAttribute {
  return { enabled: attribute?.enabled ?? false, required: attribute?.required ?? false };
}

function toEmails(user: UserResource): UserProfileEmail[] {
  return sortByVerification(user.emailAddresses, user.primaryEmailAddressId).map(email => ({
    id: email.id,
    value: email.emailAddress,
    isDefault: email.id === user.primaryEmailAddressId,
    isVerified: email.verification.status === 'verified',
  }));
}

function toPhones(user: UserResource): UserProfilePhone[] {
  return sortByVerification(user.phoneNumbers, user.primaryPhoneNumberId).map(phone => ({
    id: phone.id,
    value: phone.phoneNumber,
    isDefault: phone.id === user.primaryPhoneNumberId,
    isVerified: phone.verification.status === 'verified',
  }));
}

export function useUserProfileAccountSectionModel(): UserProfileAccountSectionModel {
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const { attributes, usernameSettings } = environment.userSettings;
  const usernameAttribute = attributes.username;
  const usernameImmutable = Boolean(usernameAttribute?.immutable);
  const showUsername = isAttributeAvailable(usernameAttribute) && !(usernameImmutable && !user.username);
  const nameManagedBy = toManagedBy(user.enterpriseAccounts.find(account => account.active));
  const showEmails = isAttributeAvailable(attributes.email_address);
  const emailsImmutable = Boolean(attributes.email_address?.immutable);
  const showPhones = isAttributeAvailable(attributes.phone_number);

  return {
    status: 'ready',
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
    emails: showEmails ? toEmails(user) : undefined,
    phones: showPhones ? toPhones(user) : undefined,
    onSetPrimaryEmail: showEmails ? id => save(() => user.update({ primaryEmailAddressId: id })) : undefined,
    onRemoveEmail: showEmails && !emailsImmutable ? id => save(() => emailById(user, id).destroy()) : undefined,
    onProfilePictureChange: file => save(() => user.setProfileImage({ file })),
    onRemoveProfilePicture: user.hasImage ? () => save(() => user.setProfileImage({ file: null })) : undefined,
    onSubmitName: nameManagedBy
      ? undefined
      : value => save(() => user.update({ firstName: value.firstName, lastName: value.lastName }), NAME_FIELDS),
    onSubmitUsername:
      showUsername && !usernameImmutable
        ? username =>
            save(() => user.update({ username }), USERNAME_FIELDS, {
              min_length: usernameSettings.min_length,
              max_length: usernameSettings.max_length,
            })
        : undefined,
  };
}
