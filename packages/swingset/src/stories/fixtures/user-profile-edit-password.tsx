import { Button } from '@clerk/mosaic/components/button';
import type { UserProfileFormError } from '@clerk/mosaic/features/user-profile/user-profile.types';
import { UserProfileSaveError } from '@clerk/mosaic/features/user-profile/user-profile.types';
import { useUserProfileEditPasswordController } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-edit-password.dialog';
import type {
  UserProfileEditPasswordValue,
  UserProfilePasswordPolicy,
} from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.types';
import { useMessages } from '@clerk/mosaic/localization';
import { useState } from 'react';

export interface UserProfileEditPasswordFixtureOptions {
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  latency?: number;
  /** Rejects the first save so the next attempt can succeed. */
  failWith?: UserProfileFormError;
}

export function useUserProfileEditPasswordFixture({
  hasPassword: initialHasPassword = true,
  requiresCurrentPassword = true,
  latency = 800,
  failWith,
}: UserProfileEditPasswordFixtureOptions = {}) {
  const m = useMessages('userProfilePasswordSection');
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [hasFailed, setHasFailed] = useState(false);
  const policy: UserProfilePasswordPolicy = hasPassword
    ? { mode: 'change', requiresCurrentPassword }
    : { mode: 'set', requiresCurrentPassword: false };
  const controller = useUserProfileEditPasswordController({
    policy,
    onSubmit: async (_value: UserProfileEditPasswordValue) => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (failWith && !hasFailed) {
        setHasFailed(true);
        throw new UserProfileSaveError(failWith.message ?? 'Something went wrong.', failWith.fields);
      }
      setHasPassword(true);
    },
  });

  return {
    hasPassword,
    action: (
      <UserProfileEditPasswordDialog
        form={controller.form}
        passwordFeedback={controller.passwordFeedback}
        hasPassword={hasPassword}
        open={controller.isOpen}
        onOpenChange={controller.onOpenChange}
        requiresCurrentPassword={policy.requiresCurrentPassword}
        trigger={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          >
            {hasPassword ? m.change : m.set}
          </Button>
        }
      />
    ),
  };
}
