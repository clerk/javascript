import { isReverificationCancelledError } from '@clerk/shared/error';
import { validate as validateComplexity } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';
import { createValidatePasswordStrength } from '@clerk/shared/internal/clerk-js/passwords/strength';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, UserResource } from '@clerk/shared/types';
import { useMemo } from 'react';

import type { FieldFeedback } from '../../../components/form';
import { FormSubmitError } from '../../../components/form';
import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useErrorText, useLocale, useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import { useReverificationFlow } from '../../reverification';
import { type UserProfileActionContext, useUserProfileUserModel } from '../user-profile-user.model';
import { passwordFormError } from './user-profile-password-errors';
import { passwordFieldFeedback } from './user-profile-password-feedback';
import type { UserProfileEditPasswordValue, UserProfilePasswordPolicy } from './user-profile-password-section.types';

type UnavailablePasswordModel =
  | { status: 'hidden' }
  | {
      status: 'readonly';
      mode: 'set' | 'change';
      managedBy: { name: string };
    };

export type UserProfilePasswordModel =
  | { status: 'loading' }
  | UnavailablePasswordModel
  | (UserProfilePasswordPolicy & {
      status: 'ready';
      userId: string;
      sessionId: string;
      identifier: string;
      validatePassword: (password: string) => Promise<FieldFeedback | undefined>;
      updatePassword: (input: UserProfileEditPasswordValue) => Promise<void>;
      reverification: ReverificationController;
    });

type PasswordUpdateTarget = UserProfilePasswordPolicy & { userId: string; sessionId: string };

function getAvailablePasswordUser(
  user: UserResource | null | undefined,
  sessionId: string | null | undefined,
  environment: EnvironmentResource | undefined,
  target: PasswordUpdateTarget,
  unavailableMessage: string,
): UserResource {
  if (
    !user ||
    user.id !== target.userId ||
    sessionId !== target.sessionId ||
    !environment?.userSettings.instanceIsPasswordBased ||
    user.enterpriseAccounts.some(account => account.active) ||
    user.passwordEnabled !== (target.mode === 'change')
  ) {
    throw new FormSubmitError({ message: unavailableMessage });
  }
  return user;
}

type PasswordPolicyResult =
  | { status: 'hidden' }
  | { status: 'readonly'; mode: 'set' | 'change'; enterpriseConnectionName: string | undefined }
  | (UserProfilePasswordPolicy & { status: 'ready'; userId: string });

function getPasswordPolicy(
  user: UserResource | null | undefined,
  environment: EnvironmentResource,
): PasswordPolicyResult {
  if (!user) {
    return { status: 'hidden' as const };
  }

  if (!environment.userSettings.instanceIsPasswordBased) {
    return { status: 'hidden' as const };
  }

  const policy: UserProfilePasswordPolicy = user.passwordEnabled
    ? { mode: 'change', requiresCurrentPassword: !environment.authConfig.reverification }
    : { mode: 'set', requiresCurrentPassword: false };

  const enterpriseAccount = user.enterpriseAccounts.find(account => account.active);
  if (enterpriseAccount) {
    return {
      status: 'readonly',
      mode: policy.mode,
      enterpriseConnectionName: enterpriseAccount.enterpriseConnection?.name,
    };
  }

  return { status: 'ready', userId: user.id, ...policy };
}

export function useUserProfilePasswordActions(context?: UserProfileActionContext) {
  const actionUser = useUserProfileUserModel(context);
  const clerk = useClerk();
  const m = useMessages('userProfilePasswordSection');
  const locale = useLocale();
  const errorText = useErrorText();
  const errorMessages = useMessages('errors');
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const passwordSettings = environment?.userSettings.passwordSettings;
  const moduleManager = clerk.__internal_moduleManager;
  const validatePassword = useMemo(
    () =>
      async (password: string): Promise<FieldFeedback | undefined> => {
        if (!passwordSettings) {
          throw new FormSubmitError({ message: m.errors.unavailable });
        }
        const complexity = validateComplexity(password, passwordSettings);
        if (Object.keys(complexity).length > 0 || !passwordSettings.show_zxcvbn) {
          return passwordFieldFeedback({ complexity }, passwordSettings, m, locale);
        }
        if (!moduleManager) {
          throw new FormSubmitError({ message: errorMessages.generic });
        }
        const { loadZxcvbn } = createLoadZxcvbn(moduleManager);
        const strength = createValidatePasswordStrength(passwordSettings)(await loadZxcvbn())(password);
        return passwordFieldFeedback({ complexity, strength }, passwordSettings, m, locale);
      },
    [passwordSettings, moduleManager, m, locale, errorMessages],
  );

  const [updatePasswordWithReverification, reverification] = useReverificationFlow(
    async (input: UserProfileEditPasswordValue, target: PasswordUpdateTarget) => {
      if (actionUser.status !== 'ready') {
        throw new FormSubmitError({ message: m.errors.unavailable });
      }
      actionUser.currentUser();
      const currentUser = getAvailablePasswordUser(
        clerk.user,
        clerk.session?.id,
        environment,
        target,
        m.errors.unavailable,
      );

      await currentUser.updatePassword({
        newPassword: input.newPassword,
        signOutOfOtherSessions: input.signOutOfOtherSessions,
        ...(target.requiresCurrentPassword ? { currentPassword: input.currentPassword } : {}),
      });
    },
  );

  if (!isUserLoaded || !isSessionLoaded || !environment || actionUser.status !== 'ready') {
    return { status: 'loading' as const };
  }

  if (!session) {
    return { status: 'hidden' as const };
  }

  const policy = getPasswordPolicy(user, environment);
  if (policy.status === 'readonly') {
    return { status: 'hidden' as const };
  }
  if (policy.status !== 'ready') {
    return policy;
  }

  const sessionId = session.id;
  const target: PasswordUpdateTarget = { ...policy, sessionId };

  return {
    ...policy,
    sessionId,
    identifier: session.publicUserData.identifier ?? '',
    validatePassword,
    reverification,
    updatePassword: async (input: UserProfileEditPasswordValue) => {
      try {
        getAvailablePasswordUser(clerk.user, clerk.session?.id, environment, target, m.errors.unavailable);
        actionUser.currentUser();
        await updatePasswordWithReverification(input, target);
        context?.onMutation();
      } catch (error) {
        if (isReverificationCancelledError(error) || error instanceof FormSubmitError) {
          throw error;
        }
        throw passwordFormError(
          error,
          policy.requiresCurrentPassword,
          environment.userSettings.passwordSettings,
          m,
          locale,
          errorText,
        );
      }
    },
  };
}

export function projectPassword(
  user: {
    passwordEnabled: boolean;
    enterpriseAccounts: readonly { active: boolean; enterpriseConnection: { name: string } | null }[];
  },
  passwordEnabled: boolean,
) {
  return {
    visible: passwordEnabled,
    hasPassword: user.passwordEnabled,
    managedBy: user.enterpriseAccounts.find(account => account.active)?.enterpriseConnection?.name,
    managed: user.enterpriseAccounts.some(account => account.active),
  };
}

export function useUserProfilePasswordModel(): UserProfilePasswordModel {
  const { isLoaded: isSessionLoaded, session } = useSession();
  const actions = useUserProfilePasswordActions();
  const model = useUserProfileUserModel();
  const m = useMessages('userProfilePasswordSection');
  if (model.status !== 'ready') {
    return model;
  }
  if (!isSessionLoaded) {
    return { status: 'loading' };
  }
  if (!session) {
    return { status: 'hidden' };
  }
  const display = projectPassword(model.user, model.environment.userSettings.instanceIsPasswordBased);
  if (!display.visible) {
    return { status: 'hidden' };
  }
  if (display.managed) {
    return {
      status: 'readonly',
      mode: display.hasPassword ? 'change' : 'set',
      managedBy: { name: display.managedBy || m.enterpriseConnection },
    };
  }
  return actions;
}
