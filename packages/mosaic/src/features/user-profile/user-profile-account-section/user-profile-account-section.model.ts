import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';
import type {
  AttributeData,
  EmailAddressResource,
  EnterpriseAccountResource,
  PhoneNumberResource,
  UserResource,
} from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import type { MosaicRouter } from '../../../hooks/useMosaicRouter';
import { useMosaicRouter } from '../../../hooks/useMosaicRouter';
import { save } from '../../../utils/form-error';
import type { UserProfileManagedBy } from '../user-profile-managed-by';
import type {
  UserProfileEmailVerification,
  UserProfileEmailVerifier,
  UserProfileNameAttribute,
  UserProfilePhoneVerifier,
} from './user-profile-account-section.types';
import { isAttributeAvailable, toContacts } from './user-profile-account-section.utils';
import type { UserProfileAccountSectionViewProps } from './user-profile-account-section.view';
import type { UserProfileAddEmailField } from './user-profile-add-email.controller';
import type { UserProfileAddPhoneField } from './user-profile-add-phone.controller';
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
  | 'onCreateEmail'
  | 'getEmailVerifier'
  | 'onSetPrimaryEmail'
  | 'onRemoveEmail'
  | 'onCreatePhone'
  | 'getPhoneVerifier'
  | 'onSetPrimaryPhone'
  | 'onRemovePhone'
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
const ADD_EMAIL_FIELDS: readonly UserProfileAddEmailField[] = ['emailAddress', 'code'];
const ADD_PHONE_FIELDS: readonly UserProfileAddPhoneField[] = ['phoneNumber', 'code'];

function byId<T extends { id: string }>(items: T[], id: string, kind: string): T {
  const item = items.find(item => item.id === id);
  if (!item) {
    throw new Error(`No ${kind} with id ${id}`);
  }
  return item;
}

function verifyRedirectUrl(userProfileUrl: string): string {
  const url = new URL(userProfileUrl);
  url.hash = '/verify';
  return url.toString();
}

function startEmailVerification(
  email: EmailAddressResource,
  linkRedirectUrl: string | undefined,
  router: MosaicRouter,
): UserProfileEmailVerification {
  if (email.matchesSsoConnection) {
    const { startEnterpriseSSOLinkFlow, cancelEnterpriseSSOLinkFlow } = email.createEnterpriseSSOLinkFlow();
    return {
      method: 'sso',
      verified: save(() => startEnterpriseSSOLinkFlow({ redirectUrl: window.location.href })),
      cancel: cancelEnterpriseSSOLinkFlow,
      connect: () => {
        const url = email.verification.externalVerificationRedirectURL;
        if (url) {
          void router.navigate(url.href);
        }
      },
    };
  }
  if (linkRedirectUrl === undefined) {
    return { method: 'code', sent: save(() => email.prepareVerification({ strategy: 'email_code' })) };
  }
  const { startEmailLinkFlow, cancelEmailLinkFlow } = email.createEmailLinkFlow();
  return {
    method: 'link',
    verified: save(() => startEmailLinkFlow({ redirectUrl: linkRedirectUrl })),
    cancel: cancelEmailLinkFlow,
  };
}

function toEmailVerifier(
  email: EmailAddressResource,
  linkRedirectUrl: string | undefined,
  router: MosaicRouter,
): UserProfileEmailVerifier {
  return {
    start: () => startEmailVerification(email, linkRedirectUrl, router),
    verifyCode: code => save(() => email.attemptVerification({ code }), ADD_EMAIL_FIELDS),
  };
}

function canAddIdentifications(user: UserResource, enterpriseSSOEnabled: boolean): boolean {
  return (
    !enterpriseSSOEnabled ||
    !user.enterpriseAccounts.some(
      account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
    )
  );
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

function toPhoneVerifier(phone: PhoneNumberResource): UserProfilePhoneVerifier {
  return {
    sendCode: () => save(() => phone.prepareVerification(), ADD_PHONE_FIELDS),
    verifyCode: code => save(() => phone.attemptVerification({ code }), ADD_PHONE_FIELDS),
  };
}

export function useUserProfileAccountSectionModel(): UserProfileAccountSectionModel {
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const { attributes, usernameSettings, enterpriseSSO } = environment.userSettings;
  const usernameAttribute = attributes.username;
  const usernameImmutable = Boolean(usernameAttribute?.immutable);
  const showUsername = isAttributeAvailable(usernameAttribute) && !(usernameImmutable && !user.username);
  const nameManagedBy = toManagedBy(user.enterpriseAccounts.find(account => account.active));
  const showEmails = isAttributeAvailable(attributes.email_address);
  const emailsImmutable = Boolean(attributes.email_address?.immutable);
  const canCreateEmail = showEmails && !emailsImmutable && canAddIdentifications(user, enterpriseSSO.enabled);
  const verifiesEmailByLink = Boolean(attributes.email_address?.verifications.includes('email_link'));
  const showPhones = isAttributeAvailable(attributes.phone_number);
  const phonesImmutable = Boolean(attributes.phone_number?.immutable);
  const canCreatePhone = showPhones && !phonesImmutable && canAddIdentifications(user, enterpriseSSO.enabled);
  const linkRedirectUrl = verifiesEmailByLink ? verifyRedirectUrl(environment.displayConfig.userProfileUrl) : undefined;
  const verifierFor = (email: EmailAddressResource) => toEmailVerifier(email, linkRedirectUrl, router);

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
    emails: showEmails
      ? toContacts(user.emailAddresses, user.primaryEmailAddressId, email => email.emailAddress)
      : undefined,
    phones: showPhones
      ? toContacts(user.phoneNumbers, user.primaryPhoneNumberId, phone => phone.phoneNumber)
      : undefined,
    onCreateEmail: canCreateEmail
      ? async emailAddress => {
          const request = user.createEmailAddress({ email: emailAddress });
          await save(() => request, ADD_EMAIL_FIELDS);
          return verifierFor(await request);
        }
      : undefined,
    getEmailVerifier: showEmails ? id => verifierFor(byId(user.emailAddresses, id, 'email address')) : undefined,
    onSetPrimaryEmail: showEmails ? id => save(() => user.update({ primaryEmailAddressId: id })) : undefined,
    onRemoveEmail:
      showEmails && !emailsImmutable
        ? id => save(() => byId(user.emailAddresses, id, 'email address').destroy())
        : undefined,
    onCreatePhone: canCreatePhone
      ? async phoneNumber => {
          const request = user.createPhoneNumber({ phoneNumber });
          await save(() => request, ADD_PHONE_FIELDS);
          return toPhoneVerifier(await request);
        }
      : undefined,
    getPhoneVerifier: showPhones ? id => toPhoneVerifier(byId(user.phoneNumbers, id, 'phone number')) : undefined,
    onSetPrimaryPhone: showPhones ? id => save(() => user.update({ primaryPhoneNumberId: id })) : undefined,
    onRemovePhone:
      showPhones && !phonesImmutable
        ? id => save(() => byId(user.phoneNumbers, id, 'phone number').destroy())
        : undefined,
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
