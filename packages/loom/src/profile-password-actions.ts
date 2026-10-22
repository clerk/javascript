import { validate as validateComplexity } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';
import { createValidatePasswordStrength } from '@clerk/shared/internal/clerk-js/passwords/strength';

import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActions } from './profile-actions-types';
import type { ProfileEnvironment } from './profile-host-types';

export function passwordActions(
  host: ClerkSessionsHost,
  owner: LoomClient,
  current: () => NonNullable<ClerkSessionsHost['user']>,
  environment: () => ProfileEnvironment,
): ProfileActions['password'] {
  const user = current();
  const policy = host.__internal_environment;
  if (
    !policy?.userSettings.instanceIsPasswordBased ||
    user.enterpriseAccounts?.some(account => account.active) ||
    !user.updatePassword
  ) {
    return { status: 'unavailable' };
  }
  const mode = user.passwordEnabled ? 'change' : 'set';
  const requiresCurrentPassword = mode === 'change' && !policy.authConfig.reverification;
  const settings = { ...policy.userSettings.passwordSettings };
  const target = () => {
    const user = current();
    const policy = environment();
    if (
      !policy.userSettings.instanceIsPasswordBased ||
      user.enterpriseAccounts?.some(account => account.active) ||
      Boolean(user.passwordEnabled) !== (mode === 'change') ||
      (mode === 'change' && !policy.authConfig.reverification) !== requiresCurrentPassword ||
      !user.updatePassword
    ) {
      throw new Error('Password unavailable.');
    }
    return user;
  };
  return {
    status: 'ready',
    mode,
    requiresCurrentPassword,
    settings,
    userId: user.id,
    sessionId: owner.scope.sessionId,
    identifier: host.session?.publicUserData?.identifier ?? '',
    validate: async password => {
      target();
      const settings = environment().userSettings.passwordSettings;
      const complexity = validateComplexity(password, settings);
      if (Object.keys(complexity).length > 0 || !settings.show_zxcvbn) {
        return { complexity };
      }
      if (!host.__internal_moduleManager) {
        throw new Error('Password validation unavailable.');
      }
      const { loadZxcvbn } = createLoadZxcvbn(host.__internal_moduleManager);
      const zxcvbn = await loadZxcvbn();
      target();
      return { complexity, strength: createValidatePasswordStrength(settings)(zxcvbn)(password) };
    },
    update: input =>
      owner.mutateProfile(async () => {
        const user = target();
        if (!user.updatePassword) {
          throw new Error('Password unavailable.');
        }
        await user.updatePassword({
          newPassword: input.newPassword,
          signOutOfOtherSessions: input.signOutOfOtherSessions,
          ...(requiresCurrentPassword ? { currentPassword: input.currentPassword } : {}),
        });
        current();
      }),
  };
}
