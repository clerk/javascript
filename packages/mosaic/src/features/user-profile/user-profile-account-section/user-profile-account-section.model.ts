import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useUser } from '@clerk/shared/react';
import type {
  AttributeData,
  Attributes,
  EmailAddressResource,
  EnterpriseAccountResource,
  PhoneNumberResource,
  UserResource,
} from '@clerk/shared/types';

import { toCountryIso } from '../../../components/phone-input';
import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import type { MosaicRouter } from '../../../hooks/use-mosaic-router';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import type { MessageValues } from '../../../localization';
import { save, SaveError, UNEXPECTED_ERROR } from '../../../utils/errors';
import type { UserProfileManagedBy } from '../user-profile-managed-by';
import type {
  UserProfileEmailVerification,
  UserProfileEmailVerifier,
  UserProfileNameAttribute,
  UserProfilePhoneVerifier,
} from './user-profile-account-section.types';
import { isAttributeAvailable, toContactAccess, toContacts } from './user-profile-account-section.utils';
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
  | 'usernameRequired'
  | 'emails'
  | 'phones'
  | 'defaultPhoneCountry'
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
  | (UserProfileAccountSectionData & { status: 'ready'; userId: string });

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

/*
  TODO: pick this base the way the routing mode says to. Legacy `buildVerificationRedirectUrl` only
  falls back to `displayConfig.userProfileUrl` under virtual routing, and builds a path instead of a
  hash when the host routes by path — Mosaic has no routing yet, so this always hashes onto the
  instance's profile URL and sends a path-routed host's user back to the wrong place. #9843 adds
  `MosaicRoutingProvider`; wire this to it once that lands.

  Whatever base wins, nothing in Mosaic serves the `/verify` the link lands on: there is no route and
  no equivalent of legacy's `VerificationSuccessPage`, so an opened link is handled by whatever
  clerk-js already mounts there. That page has to come with the routing work, not after it.
*/
function verifyRedirectUrl(userProfileUrl: string): string {
  return buildURL({ base: userProfileUrl, hashPath: '/verify' }, { stringify: true });
}

function startEmailVerification(
  email: EmailAddressResource,
  linkRedirectUrl: string | undefined,
  router: MosaicRouter,
): UserProfileEmailVerification {
  if (email.matchesSsoConnection) {
    return {
      method: 'sso',
      /*
        Prepared on the click rather than on entering the step, so the redirect URL the server
        answers with is in hand by the time we navigate. Preparing on entry leaves the button live
        before the response lands, and an early click has nowhere to go.

        TODO: carry the mounting mode back from the IdP. Legacy appends `appendModalState` to this
        redirect when the profile is mounted as a modal, so returning from the provider reopens the
        modal on the step the user left. Mosaic has no modal mode to encode yet; whoever adds one has
        to encode it here too, or the user comes back to a closed dialog and a lost flow.
      */
      connect: () =>
        save(async () => {
          const prepared = await email.prepareVerification({
            strategy: 'enterprise_sso',
            redirectUrl: window.location.href,
          });
          const url = prepared.verification.externalVerificationRedirectURL;
          if (!url) {
            throw new Error('Enterprise SSO verification did not return a redirect URL');
          }
          await router.navigate(url.href);
        }),
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
  return { name: connection?.name || account.provider.replace(/^(oauth_|saml_)/, '') };
}

function toNameAttribute(attribute: AttributeData | undefined): UserProfileNameAttribute {
  return { enabled: attribute?.enabled ?? false, required: attribute?.required ?? false };
}

function toPhoneVerifier(phone: PhoneNumberResource): UserProfilePhoneVerifier {
  return {
    sendCode: () => save(() => phone.prepareVerification()),
    verifyCode: code => save(() => phone.attemptVerification({ code }), ADD_PHONE_FIELDS),
  };
}

type SaveAsUser = (run: (current: UserResource) => Promise<unknown>) => Promise<void>;

type ContactActions = {
  user: UserResource;
  access: ReturnType<typeof toContactAccess>;
  currentUser: () => UserResource;
  saveAsUser: SaveAsUser;
};

function toEmailProps(
  { user, access, currentUser, saveAsUser }: ContactActions,
  verifierFor: (email: EmailAddressResource) => UserProfileEmailVerifier,
): Pick<
  UserProfileAccountSectionData,
  'emails' | 'onCreateEmail' | 'getEmailVerifier' | 'onSetPrimaryEmail' | 'onRemoveEmail'
> {
  if (!access.show) {
    return {};
  }
  return {
    emails: toContacts(user.emailAddresses, user.primaryEmailAddressId, email => email.emailAddress),
    onCreateEmail: access.canCreate
      ? async emailAddress => {
          const request = currentUser().createEmailAddress({ email: emailAddress });
          await save(() => request, ADD_EMAIL_FIELDS);
          return verifierFor(await request);
        }
      : undefined,
    getEmailVerifier: id => verifierFor(byId(user.emailAddresses, id, 'email address')),
    onSetPrimaryEmail: id => saveAsUser(current => current.update({ primaryEmailAddressId: id })),
    onRemoveEmail: access.canRemove
      ? id => saveAsUser(current => byId(current.emailAddresses, id, 'email address').destroy())
      : undefined,
  };
}

function toPhoneProps({
  user,
  access,
  currentUser,
  saveAsUser,
}: ContactActions): Pick<
  UserProfileAccountSectionData,
  'phones' | 'onCreatePhone' | 'getPhoneVerifier' | 'onSetPrimaryPhone' | 'onRemovePhone'
> {
  if (!access.show) {
    return {};
  }
  return {
    phones: toContacts(user.phoneNumbers, user.primaryPhoneNumberId, phone => phone.phoneNumber),
    onCreatePhone: access.canCreate
      ? async phoneNumber => {
          const request = currentUser().createPhoneNumber({ phoneNumber });
          await save(() => request, ADD_PHONE_FIELDS);
          return toPhoneVerifier(await request);
        }
      : undefined,
    getPhoneVerifier: id => toPhoneVerifier(byId(user.phoneNumbers, id, 'phone number')),
    onSetPrimaryPhone: id => saveAsUser(current => current.update({ primaryPhoneNumberId: id })),
    onRemovePhone: access.canRemove
      ? id => saveAsUser(current => byId(current.phoneNumbers, id, 'phone number').destroy())
      : undefined,
  };
}

export function useUserProfileAccountSectionModel(): UserProfileAccountSectionModel {
  const { isLoaded, user } = useUser();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const userId = user.id;

  const currentUser = (): UserResource => {
    const current = clerk.user;
    if (!current || current.id !== userId) {
      throw new SaveError({ global: UNEXPECTED_ERROR });
    }
    return current;
  };

  const saveAsUser = <TField extends string = never>(
    run: (current: UserResource) => Promise<unknown>,
    fields: readonly TField[] = [],
    params?: MessageValues,
  ): Promise<void> => save(() => run(currentUser()), fields, params);

  const { usernameSettings, enterpriseSSO } = environment.userSettings;
  const attributes: Partial<Attributes> = environment.userSettings.attributes;
  const usernameAttribute = attributes.username;
  const usernameImmutable = Boolean(usernameAttribute?.immutable);
  const showUsername = isAttributeAvailable(usernameAttribute) && !(usernameImmutable && !user.username);
  const nameManagedBy = toManagedBy(user.enterpriseAccounts.find(account => account.active));
  const canAddMore = canAddIdentifications(user, enterpriseSSO.enabled);
  const emailAccess = toContactAccess(attributes.email_address, user.emailAddresses.length, canAddMore);
  const phoneAccess = toContactAccess(attributes.phone_number, user.phoneNumbers.length, canAddMore);
  const verifiesEmailByLink = Boolean(attributes.email_address?.verifications.includes('email_link'));
  const linkRedirectUrl = verifiesEmailByLink ? verifyRedirectUrl(environment.displayConfig.userProfileUrl) : undefined;
  const verifierFor = (email: EmailAddressResource) => toEmailVerifier(email, linkRedirectUrl, router);

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
    ...toEmailProps({ user, access: emailAccess, currentUser, saveAsUser }, verifierFor),
    ...toPhoneProps({ user, access: phoneAccess, currentUser, saveAsUser }),
    defaultPhoneCountry: toCountryIso(clerk.__internal_country),
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
