import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import type { EmailAddressResource, UserResource } from '@clerk/shared/types';

import type { MosaicRouter } from '../../../hooks/use-mosaic-router';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import { allowsIdentificationCreation } from '../../../utils/allows-identification-creation';
import { save } from '../../../utils/errors';
import { useReverificationFlow } from '../../reverification';
import { useUserProfileModalReturn } from '../user-profile.modal-return';
import type { UserProfileEmailVerification, UserProfileEmailVerifier } from '../user-profile-contact.types';
import { byId, toContactAccess, toContacts } from '../user-profile-contact.utils';
import { useUserProfileUserModel } from '../user-profile-user.model';
import type { UserProfileAddEmailField } from './user-profile-add-email.controller';
import type { UserProfileEmailSectionModel } from './user-profile-email-section.types';

const ADD_EMAIL_FIELDS: readonly UserProfileAddEmailField[] = ['emailAddress', 'code'];

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
  withModalReturn: (url: string) => string,
): UserProfileEmailVerification {
  if (email.matchesSsoConnection) {
    return {
      method: 'sso',
      /*
        Prepared on the click rather than on entering the step, so the redirect URL the server
        answers with is in hand by the time we navigate. Preparing on entry leaves the button live
        before the response lands, and an early click has nowhere to go.
      */
      connect: () =>
        save(async () => {
          const prepared = await email.prepareVerification({
            strategy: 'enterprise_sso',
            redirectUrl: withModalReturn(window.location.href),
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
  withModalReturn: (url: string) => string,
): UserProfileEmailVerifier {
  return {
    start: () => startEmailVerification(email, linkRedirectUrl, router, withModalReturn),
    verifyCode: code => save(() => email.attemptVerification({ code }), ADD_EMAIL_FIELDS),
  };
}

export function useUserProfileEmailSectionModel(): UserProfileEmailSectionModel {
  const model = useUserProfileUserModel();
  const router = useMosaicRouter();
  const withModalReturn = useUserProfileModalReturn();
  const [removeEmail, removeReverification] = useReverificationFlow((user: UserResource, id: string) =>
    byId(user.emailAddresses, id, 'email address').destroy(),
  );
  const [setPrimaryEmail, setPrimaryReverification] = useReverificationFlow((user: UserResource, id: string) =>
    user.update({ primaryEmailAddressId: id }),
  );
  const [createEmail, createReverification] = useReverificationFlow(
    (currentUser: () => UserResource, emailAddress: string) =>
      currentUser().createEmailAddress({ email: emailAddress }),
  );
  if (model.status !== 'ready') {
    return model;
  }

  const { user, environment, currentUser, saveAsUser } = model;
  const { attributes, enterpriseSSO } = environment.userSettings;
  const access = toContactAccess(
    attributes.email_address,
    user.emailAddresses.length,
    allowsIdentificationCreation(user, enterpriseSSO),
  );

  if (!access.show) {
    return { status: 'hidden' };
  }

  const verifiesByLink = Boolean(attributes.email_address?.verifications.includes('email_link'));
  const linkRedirectUrl = verifiesByLink ? verifyRedirectUrl(environment.displayConfig.userProfileUrl) : undefined;
  const verifierFor = (email: EmailAddressResource) => toEmailVerifier(email, linkRedirectUrl, router, withModalReturn);

  return {
    status: 'ready',
    userId: user.id,
    emails: toContacts(user.emailAddresses, user.primaryEmailAddressId, email => email.emailAddress),
    username: user.username ?? undefined,
    onCreateEmail: access.canCreate
      ? async emailAddress => {
          const request = createEmail(currentUser, emailAddress);
          await save(() => request, ADD_EMAIL_FIELDS);
          return verifierFor(await request);
        }
      : undefined,
    getEmailVerifier: id => verifierFor(byId(user.emailAddresses, id, 'email address')),
    onSetPrimaryEmail: id => saveAsUser(current => setPrimaryEmail(current, id)),
    onRemoveEmail: access.canRemove ? id => saveAsUser(current => removeEmail(current, id)) : undefined,
    removeReverification,
    setPrimaryReverification,
    createReverification,
  };
}
