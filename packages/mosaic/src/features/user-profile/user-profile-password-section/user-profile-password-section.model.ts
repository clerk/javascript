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
      updatePassword: (input: UserProfileEditPasswordValue) => Promise<unknown>;
      formatError: (error: unknown) => unknown;
    });

type PasswordPolicyResult =
  | { status: 'hidden' }
  | { status: 'readonly'; mode: 'set' | 'change'; enterpriseConnectionName: string | undefined }
  | (UserProfilePasswordPolicy & { status: 'ready'; userId: string });

function getPasswordPolicy(
  user: UserResource | null | undefined,
  environment: EnvironmentResource,
): PasswordPolicyResult {
  if (!user) {
    return { status: 'hidden' };
  }

  if (!environment.userSettings.instanceIsPasswordBased) {
    return { status: 'hidden' };
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

export function useUserProfilePasswordModel(): UserProfilePasswordModel {
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

  if (!isUserLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!session) {
    return { status: 'hidden' };
  }

  const policy = getPasswordPolicy(user, environment);
  if (policy.status === 'readonly') {
    return {
      status: 'readonly',
      mode: policy.mode,
      managedBy: { name: policy.enterpriseConnectionName || m.enterpriseConnection },
    };
  }
  if (policy.status !== 'ready') {
    return policy;
  }

  const userId = policy.userId;
  const sessionId = session.id;

  return {
    ...policy,
    sessionId,
    identifier: session.publicUserData.identifier ?? '',
    validatePassword,
    updatePassword: async ({ currentPassword, newPassword, signOutOfOtherSessions }) => {
      const currentUser = clerk.user;
      if (
        !currentUser ||
        currentUser.id !== userId ||
        clerk.session?.id !== sessionId ||
        !environment.userSettings.instanceIsPasswordBased ||
        currentUser.enterpriseAccounts.some(account => account.active) ||
        currentUser.passwordEnabled !== (policy.mode === 'change')
      ) {
        throw new FormSubmitError({ message: m.errors.unavailable });
      }

      return currentUser.updatePassword({
        newPassword,
        signOutOfOtherSessions,
        ...(policy.requiresCurrentPassword ? { currentPassword } : {}),
      });
    },
    formatError: error =>
      error instanceof FormSubmitError
        ? error
        : passwordFormError(
            error,
            policy.requiresCurrentPassword,
            environment.userSettings.passwordSettings,
            m,
            locale,
            errorText,
          ),
  };
}
