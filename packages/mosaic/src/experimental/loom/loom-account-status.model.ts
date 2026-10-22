import { useSuspenseProfile, useSuspenseUser } from '@clerk/loom/react';
import { isReverificationCancelledError } from '@clerk/shared/error';

import { FormSubmitError } from '../../components/form';
import { useReverificationFlow } from '../../features/reverification';
import { useUserProfileOptions } from '../../features/user-profile/user-profile.provider';
import {
  createProviderCatalog,
  projectConnectedAccounts,
} from '../../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';
import { passwordFormError } from '../../features/user-profile/user-profile-password-section/user-profile-password-errors';
import { passwordFieldFeedback } from '../../features/user-profile/user-profile-password-section/user-profile-password-feedback';
import { projectPassword } from '../../features/user-profile/user-profile-password-section/user-profile-password-section.model';
import { useErrorText, useLocale, useMessages } from '../../localization';
import { allowsIdentificationCreation } from '../../utils/allows-identification-creation';

export function useLoomConnectedAccounts() {
  const { additionalOAuthScopes, mode } = useUserProfileOptions();
  const [reverifyReconnect, reconnectReverification] = useReverificationFlow((create: () => Promise<void>) => create());
  const { user, settings, actions } = useSuspenseProfile({
    additionalOAuthScopes,
    mode: mode === 'modal' ? 'modal' : 'navigation',
    reverifyReconnect,
  });
  const [removeAccount, removeReverification] = useReverificationFlow((id: string) => {
    const remove = actions.connectedAccounts.remove;
    if (!remove) {
      throw new Error('Connected account removal unavailable.');
    }
    return remove(id);
  });
  const enabled = settings.providers.filter(provider => provider.enabled).map(provider => provider.strategy);
  const social = Object.fromEntries(
    settings.providers.map(provider => [
      provider.strategy,
      { strategy: provider.strategy, name: provider.name, logo_url: provider.logoUrl },
    ]),
  );
  const providers = createProviderCatalog(enabled, social, user.externalAccounts);
  const display = projectConnectedAccounts({
    user: {
      verifiedExternalAccounts: user.externalAccounts.filter(account => account.verification?.status === 'verified'),
      unverifiedExternalAccounts: user.externalAccounts.filter(account => account.verification?.status !== 'verified'),
    },
    providers,
    socialEnabled: enabled.length > 0,
    allowCreation: allowsIdentificationCreation(user, { enabled: settings.enterpriseSsoEnabled }),
    additionalOAuthScopes,
  });
  const connected = actions.connectedAccounts;
  const connect = connected.connect;
  const reconnect = connected.reconnect;
  const remove = connected.remove;
  return {
    display,
    userId: user.id,
    actions: connected.available
      ? {
          status: 'ready' as const,
          connect: (id: string) => {
            if (!connect) {
              throw new Error('Connected account creation unavailable.');
            }
            return connect(id);
          },
          reconnect: (id: string) => {
            if (!reconnect) {
              throw new Error('Connected account reconnection unavailable.');
            }
            return reconnect(id);
          },
          remove: (id: string) => removeAccount(id),
          removeReverification,
          reconnectReverification,
          canManageAccount: (id: string) => Boolean(remove && connected.canManageAccount(id)),
          canReconnectAccount: (id: string) => Boolean(reconnect && connected.canReconnectAccount(id)),
          canConnectProvider: (id: string) => Boolean(connect && connected.canConnectProvider(id)),
        }
      : { status: 'unavailable' as const },
  };
}

export function useLoomPassword() {
  const { user, settings, actions } = useSuspenseProfile();
  const m = useMessages('userProfilePasswordSection');
  const locale = useLocale();
  const errorText = useErrorText();
  const password = actions.password;
  const [updatePassword, reverification] = useReverificationFlow(
    (input: { currentPassword?: string; newPassword: string; signOutOfOtherSessions: boolean }) => {
      if (password.status !== 'ready') {
        throw new FormSubmitError({ message: m.errors.unavailable });
      }
      return password.update(input);
    },
  );
  if (password.status !== 'ready') {
    return { display: projectPassword(user, settings.passwordEnabled), actions: { status: 'unavailable' as const } };
  }
  return {
    display: projectPassword(user, settings.passwordEnabled),
    actions: {
      status: 'ready' as const,
      ...(password.mode === 'set'
        ? { mode: 'set' as const, requiresCurrentPassword: false as const }
        : { mode: 'change' as const, requiresCurrentPassword: password.requiresCurrentPassword }),
      userId: password.userId,
      sessionId: password.sessionId,
      identifier: password.identifier,
      reverification,
      validatePassword: async (value: string) =>
        passwordFieldFeedback(await password.validate(value), password.settings, m, locale),
      updatePassword: async (input: {
        currentPassword?: string;
        newPassword: string;
        signOutOfOtherSessions: boolean;
      }) => {
        try {
          await updatePassword(input);
        } catch (error) {
          if (isReverificationCancelledError(error) || error instanceof FormSubmitError) {
            throw error;
          }
          throw passwordFormError(error, password.requiresCurrentPassword, password.settings, m, locale, errorText);
        }
      },
    },
  };
}

export function useLoomDanger() {
  const { data: user, actions } = useSuspenseUser();
  const [onDelete, reverification] = useReverificationFlow(() => {
    const remove = actions.danger.delete;
    if (!remove) {
      throw new Error('Account deletion unavailable.');
    }
    return remove();
  });
  return {
    visible: user.deleteSelfEnabled,
    actions: { ready: Boolean(actions.danger.delete), onDelete, reverification },
  };
}
