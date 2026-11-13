import { ClerkRuntimeError } from '@clerk/shared/error';
import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource, TaskSetupMFAProps, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { allowsIdentificationCreation } from '../../utils/allows-identification-creation';
import { useReverificationFlow } from '../reverification';
import {
  configuredFactors,
  createSmsActions,
  reloadUser,
  requireIdentity,
} from '../user-profile/user-profile-mfa-section/user-profile-mfa-section.model';
import type { MfaPhone } from '../user-profile/user-profile-mfa-section/user-profile-mfa-section.types';
import type { TaskSetupMfaMethod, TaskSetupMfaModel } from './task-setup-mfa.types';

export type TaskSetupMfaModelOptions = Partial<Pick<TaskSetupMFAProps, 'redirectUrlComplete'>>;

function hasOtherIdentification(user: UserResource): boolean {
  return (
    user.primaryEmailAddress !== null ||
    user.primaryWeb3Wallet !== null ||
    user.passkeys.length > 0 ||
    user.externalAccounts.length > 0 ||
    user.enterpriseAccounts.length > 0 ||
    user.username !== null
  );
}

function availablePhones(user: UserResource): MfaPhone[] {
  const keepsPrimary = hasOtherIdentification(user);
  return user.phoneNumbers
    .filter(phone => !phone.reservedForSecondFactor && (keepsPrimary || phone.id !== user.primaryPhoneNumber?.id))
    .map(phone => ({
      id: phone.id,
      phoneNumber: phone.phoneNumber,
      verified: phone.verification.status === 'verified',
    }));
}

export function useTaskSetupMfaModel(options: TaskSetupMfaModelOptions = {}): TaskSetupMfaModel {
  const clerk = useClerk();
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: sessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();
  const [createPhone, createPhoneReverification] = useReverificationFlow(
    async (current: UserResource, phoneNumber: string) => {
      const phone = await current.createPhoneNumber({ phoneNumber });
      await phone.prepareVerification();
      return phone;
    },
  );
  const [reservePhone, enrollSmsReverification] = useReverificationFlow(
    async (current: UserResource, phone: PhoneNumberResource) => {
      const result = await phone.setReservedForSecondFactor({ reserved: true });
      await reloadUser(current);
      return result;
    },
  );
  const [createTotp, authenticatorReverification] = useReverificationFlow((current: UserResource) =>
    current.createTOTP(),
  );

  if (!userLoaded || !sessionLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user || !session) {
    return { status: 'unavailable', onLeave: () => void router.navigate(clerk.buildSignInUrl()) };
  }

  const userId = user.id;
  const sessionId = session.id;
  const redirectUrlComplete = options.redirectUrlComplete || clerk.buildAfterSignInUrl();
  const task = session.currentTask;
  const secondFactors = configuredFactors(environment);
  const totpEnabled = secondFactors.includes('totp') && !user.totpEnabled;
  const smsEnabled =
    secondFactors.includes('phone_code') && allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO);
  const methods: TaskSetupMfaMethod[] = [];
  if (smsEnabled) {
    methods.push('sms');
  }
  if (totpEnabled) {
    methods.push('authenticator');
  }

  const { enrollPhoneNumber, enrollSms, resendSms } = smsEnabled
    ? createSmsActions(clerk, environment, userId, sessionId, {
        makeDefault: (_current, phone) => phone.makeDefaultSecondFactor(),
        createPhone,
        reservePhone,
      })
    : {};

  return {
    status: 'ready',
    userId,
    sessionId,
    isOnTask: Boolean(task) && (task?.key === 'setup-mfa' || clerk.__internal_setActiveInProgress),
    onLeave: () => void router.navigate(redirectUrlComplete),
    renderBranding: environment.displayConfig.branded,
    applicationName: environment.displayConfig.applicationName,
    identifier: getIdentifier(user),
    methods,
    phones: availablePhones(user),
    enrollPhoneNumber,
    enrollSms,
    resendSms,
    createAuthenticator: totpEnabled
      ? async () => {
          const current = requireIdentity(clerk, userId, sessionId);
          if (current.totpEnabled) {
            throw new ClerkRuntimeError('Authenticator is unavailable.', { code: 'mfa_authenticator_unavailable' });
          }
          const result = await createTotp(current);
          return { secret: result.secret ?? '', uri: result.uri ?? '' };
        }
      : undefined,
    verifyAuthenticator: totpEnabled
      ? async code => {
          const current = requireIdentity(clerk, userId, sessionId);
          const result = await current.verifyTOTP({ code });
          await reloadUser(current);
          return { backupCodes: result.backupCodes ?? [] };
        }
      : undefined,
    onComplete: () =>
      clerk.setActive({
        session: sessionId,
        navigate: async ({ session: next, decorateUrl }) => {
          const nextTask = next.currentTask;
          if (nextTask) {
            await router.navigate(buildTaskUrl(nextTask, { base: clerk.buildSignInUrl() }));
            return;
          }
          await router.navigate(decorateUrl(redirectUrlComplete));
        },
      }),
    onSignOut: () => {
      const otherSessions = (clerk.client?.signedInSessions ?? []).filter(item => item.id !== sessionId);
      return otherSessions.length > 0
        ? clerk.signOut({ sessionId, redirectUrl: clerk.buildAfterMultiSessionSingleSignOutUrl() })
        : clerk.signOut({ redirectUrl: clerk.buildAfterSignOutUrl() });
    },
    createPhoneReverification,
    enrollSmsReverification,
    authenticatorReverification,
  };
}
