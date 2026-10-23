import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import type { EmailAddressResource, UserResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';

import type { MosaicRouter } from '../../../hooks/use-mosaic-router';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import { save } from '../../../utils/errors';
import { useReverificationFlow } from '../../reverification';
import type { UserProfileEmailVerification, UserProfileEmailVerifier } from '../user-profile-contact.types';
import { byId, canAddIdentifications, toContactAccess, toContacts } from '../user-profile-contact.utils';
import { type UserProfileActionContext, useUserProfileUserModel } from '../user-profile-user.model';
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

async function prepareEmailVerification(
  currentEmail: () => EmailAddressResource,
  linkRedirectUrl: string | undefined,
  router: MosaicRouter,
  setCancel: (cancel: () => void) => void,
): Promise<UserProfileEmailVerification> {
  if (currentEmail().matchesSsoConnection) {
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
          const prepared = await currentEmail().prepareVerification({
            strategy: 'enterprise_sso',
            redirectUrl: window.location.href,
          });
          currentEmail();
          const url = prepared.verification.externalVerificationRedirectURL;
          if (!url) {
            throw new Error('Enterprise SSO verification did not return a redirect URL');
          }
          await router.navigate(url.href);
        }),
    };
  }
  if (linkRedirectUrl === undefined) {
    await save(() => currentEmail().prepareVerification({ strategy: 'email_code' }));
    currentEmail();
    return { method: 'code' };
  }
  const { startEmailLinkFlow, cancelEmailLinkFlow } = currentEmail().createEmailLinkFlow();
  const prepared = createDeferredPromise();
  setCancel(cancelEmailLinkFlow);
  const verified = save(() =>
    startEmailLinkFlow({
      redirectUrl: linkRedirectUrl,
      onPrepared: () => {
        currentEmail();
        prepared.resolve();
      },
    }),
  );
  void verified.catch((error: unknown) => {
    cancelEmailLinkFlow();
    prepared.reject(error);
  });
  await prepared.promise;
  return { method: 'link', verified, cancel: cancelEmailLinkFlow };
}

function toEmailVerifier(
  currentEmail: () => EmailAddressResource,
  linkRedirectUrl: string | undefined,
  router: MosaicRouter,
): UserProfileEmailVerifier {
  let cancel = () => {};
  return {
    prepare: () => {
      cancel();
      return prepareEmailVerification(currentEmail, linkRedirectUrl, router, next => {
        cancel = next;
      });
    },
    cancel: () => cancel(),
    verifyCode: code => save(() => currentEmail().attemptVerification({ code }), ADD_EMAIL_FIELDS),
  };
}

export function useUserProfileEmailActions(context?: UserProfileActionContext) {
  const model = useUserProfileUserModel(context);
  const router = useMosaicRouter();
  const [removeEmail, removeReverification] = useReverificationFlow((_user: UserResource, id: string) =>
    byId(model.status === 'ready' ? model.currentUser().emailAddresses : [], id, 'email address').destroy(),
  );
  const [setPrimaryEmail, setPrimaryReverification] = useReverificationFlow((_user: UserResource, id: string) =>
    model.status === 'ready'
      ? model
          .currentUser()
          .update({ primaryEmailAddressId: byId(model.currentUser().emailAddresses, id, 'email address').id })
      : Promise.reject(new Error('User unavailable.')),
  );
  if (model.status !== 'ready') {
    return model;
  }

  const { user, environment, currentUser, saveAsUser } = model;
  const { attributes, enterpriseSSO } = environment.userSettings;
  const access = toContactAccess(
    attributes.email_address,
    user.emailAddresses.length,
    canAddIdentifications(user, enterpriseSSO.enabled),
  );

  if (!access.show) {
    return { status: 'hidden' as const };
  }

  const verifiesByLink = Boolean(attributes.email_address?.verifications.includes('email_link'));
  const linkRedirectUrl = verifiesByLink ? verifyRedirectUrl(environment.displayConfig.userProfileUrl) : undefined;
  const verifierFor = (id: string) =>
    toEmailVerifier(() => byId(currentUser().emailAddresses, id, 'email address'), linkRedirectUrl, router);

  return {
    status: 'ready' as const,
    canManageEmail: (id: string) => user.emailAddresses.some(email => email.id === id),
    onCreateEmail: access.canCreate
      ? async (emailAddress: string) => {
          const request = currentUser().createEmailAddress({ email: emailAddress });
          await save(() => request, ADD_EMAIL_FIELDS);
          currentUser();
          context?.onMutation();
          return verifierFor((await request).id);
        }
      : undefined,
    getEmailVerifier: verifierFor,
    onSetPrimaryEmail: (id: string) => saveAsUser(current => setPrimaryEmail(current, id)),
    onRemoveEmail: access.canRemove ? (id: string) => saveAsUser(current => removeEmail(current, id)) : undefined,
    removeReverification,
    setPrimaryReverification,
  };
}

export function useUserProfileEmailSectionModel(): UserProfileEmailSectionModel {
  const model = useUserProfileUserModel();
  const actions = useUserProfileEmailActions();
  if (model.status !== 'ready' || actions.status !== 'ready') {
    return { status: model.status === 'hidden' || actions.status === 'hidden' ? 'hidden' : 'loading' };
  }
  return {
    ...actions,
    userId: model.user.id,
    username: model.user.username ?? undefined,
    emails: toContacts(model.user.emailAddresses, model.user.primaryEmailAddressId, email => email.emailAddress),
  };
}
