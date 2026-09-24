import { isClerkAPIResponseError } from '@clerk/shared/error';
import { validate as validateComplexity } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';
import { createValidatePasswordStrength } from '@clerk/shared/internal/clerk-js/passwords/strength';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, PasswordSettingsData, PasswordValidation, UserResource } from '@clerk/shared/types';
import { useCallback } from 'react';

import { FormSubmitError } from '../../../components/form';
import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import type { UserProfileEditPasswordValue } from './user-profile-password-section.types';

export function passwordFormError(error: unknown, requiresCurrentPassword: boolean): unknown {
  if (!isClerkAPIResponseError(error)) {
    return error;
  }
  const fields: { currentPassword?: string; newPassword?: string } = {};
  let message: string | undefined;
  for (const item of error.errors) {
    const text = item.longMessage || item.message;
    const name = item.meta?.paramName;
    if ((name === 'current_password' || name === 'currentPassword') && requiresCurrentPassword) {
      fields.currentPassword ??= text;
    } else if (name === 'new_password' || name === 'newPassword' || name === 'password') {
      fields.newPassword ??= text;
    } else {
      message ??= text;
    }
  }
  return new FormSubmitError({ message, fields });
}

type EditablePasswordPolicy =
  | { mode: 'set'; requiresCurrentPassword: false }
  | { mode: 'change'; requiresCurrentPassword: boolean };

type UnavailablePasswordModel =
  | { status: 'hidden'; reason: 'no_user' | 'password_disabled' }
  | { status: 'readonly'; mode: 'set' | 'change'; reason: 'enterprise_account' };

export type UserProfilePasswordModel =
  | { status: 'loading' }
  | UnavailablePasswordModel
  | (EditablePasswordPolicy & {
      status: 'ready';
      userId: string;
      sessionId: string | null;
      identifier: string;
      passwordSettings: PasswordSettingsData;
      validatePassword: (password: string) => Promise<PasswordValidation>;
      updatePassword: (input: UserProfileEditPasswordValue) => Promise<UserResource>;
    });

function getPasswordPolicy(
  user: UserResource | null | undefined,
  environment: EnvironmentResource,
): UnavailablePasswordModel | (EditablePasswordPolicy & { status: 'ready'; userId: string }) {
  if (!user) {
    return { status: 'hidden', reason: 'no_user' };
  }

  if (!environment.userSettings.instanceIsPasswordBased) {
    return { status: 'hidden', reason: 'password_disabled' };
  }

  const policy: EditablePasswordPolicy = user.passwordEnabled
    ? { mode: 'change', requiresCurrentPassword: !environment.authConfig.reverification }
    : { mode: 'set', requiresCurrentPassword: false };

  if (user.enterpriseAccounts.some(account => account.active)) {
    return { status: 'readonly', mode: policy.mode, reason: 'enterprise_account' };
  }

  return { status: 'ready', userId: user.id, ...policy };
}

export function useUserProfilePasswordModel(): UserProfilePasswordModel {
  const clerk = useClerk();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const passwordSettings = environment?.userSettings.passwordSettings;
  const moduleManager = clerk.__internal_moduleManager;
  const validatePassword = useCallback(
    async (password: string): Promise<PasswordValidation> => {
      if (!passwordSettings) {
        return {};
      }
      const complexity = validateComplexity(password, passwordSettings);
      if (Object.keys(complexity).length > 0 || !passwordSettings.show_zxcvbn || !moduleManager) {
        return { complexity };
      }
      const { loadZxcvbn } = createLoadZxcvbn(moduleManager);
      const strength = createValidatePasswordStrength(passwordSettings)(await loadZxcvbn())(password);
      return { complexity, strength };
    },
    [passwordSettings, moduleManager],
  );

  if (!isUserLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }

  const policy = getPasswordPolicy(user, environment);
  if (policy.status !== 'ready') {
    return policy;
  }

  const userId = policy.userId;
  const sessionId = session?.id ?? null;

  return {
    ...policy,
    userId,
    sessionId,
    identifier: session?.publicUserData.identifier ?? '',
    passwordSettings: environment.userSettings.passwordSettings,
    validatePassword,
    updatePassword: async ({ currentPassword, newPassword, signOutOfOtherSessions }) => {
      const currentUser = clerk.user;
      const currentPolicy = getPasswordPolicy(currentUser, environment);
      if (
        !currentUser ||
        currentUser.id !== userId ||
        !sessionId ||
        clerk.session?.id !== sessionId ||
        currentPolicy.status !== 'ready' ||
        currentPolicy.mode !== policy.mode ||
        currentPolicy.requiresCurrentPassword !== policy.requiresCurrentPassword
      ) {
        throw new Error('Password update is no longer available.');
      }

      if (policy.requiresCurrentPassword && !currentPassword) {
        throw new Error('Current password is required.');
      }

      return currentUser.updatePassword({
        newPassword,
        signOutOfOtherSessions,
        ...(policy.requiresCurrentPassword ? { currentPassword } : {}),
      });
    },
  };
}
