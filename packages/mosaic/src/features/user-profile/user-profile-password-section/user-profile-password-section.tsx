import type { ReactNode } from 'react';
import { useCallback } from 'react';

import { Button } from '../../../components/button';
import type { FieldFeedback } from '../../../components/form';
import { useErrorText, useLocale, useMessages } from '../../../localization';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from './user-profile-edit-password.dialog';
import { passwordFieldFeedback, passwordFormError } from './user-profile-password-feedback';
import type { UserProfilePasswordModel } from './user-profile-password-section.model';
import { useUserProfilePasswordModel } from './user-profile-password-section.model';
import { UserProfilePasswordSectionView } from './user-profile-password-section.view';

export interface UserProfilePasswordSectionProps {
  fallback?: ReactNode;
}

export function UserProfilePasswordSection({ fallback = null }: UserProfilePasswordSectionProps) {
  const model = useUserProfilePasswordModel();
  const m = useMessages('userProfilePasswordSection');
  if (model.status === 'loading') {
    // TODO: Add a password section skeleton as the default loading fallback.
    return fallback;
  }
  if (model.status === 'readonly') {
    return (
      <UserProfilePasswordSectionView
        hasPassword={model.mode === 'change'}
        managedBy={{
          name: model.enterpriseConnection?.name || m.enterpriseConnection,
          iconUrl: model.enterpriseConnection?.logoPublicUrl ?? undefined,
        }}
      />
    );
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <PasswordEditor
      key={`${model.userId}:${model.sessionId}`}
      model={model}
    />
  );
}

function PasswordEditor({ model }: { model: Extract<UserProfilePasswordModel, { status: 'ready' }> }) {
  const m = useMessages('userProfilePasswordSection');
  const locale = useLocale();
  const errorText = useErrorText();
  const { validatePassword, passwordSettings } = model;
  const feedback = useCallback(
    async (password: string): Promise<FieldFeedback | undefined> => {
      const validation = await validatePassword(password);
      return passwordFieldFeedback(validation, passwordSettings, m, locale);
    },
    [validatePassword, passwordSettings, m, locale],
  );
  const controller = useUserProfileEditPasswordController({
    validatePassword: feedback,
    requiresCurrentPassword: model.requiresCurrentPassword,
    onSubmit: model.updatePassword,
    formatError: error =>
      passwordFormError(error, model.requiresCurrentPassword, passwordSettings, m, locale, errorText),
  });

  return (
    <UserProfilePasswordSectionView
      hasPassword={model.mode === 'change'}
      action={
        <UserProfileEditPasswordDialog
          form={controller.form}
          passwordFeedback={controller.passwordFeedback}
          identifier={model.identifier}
          open={controller.isOpen}
          onOpenChange={controller.onOpenChange}
          hasPassword={model.mode === 'change'}
          requiresCurrentPassword={model.requiresCurrentPassword}
          trigger={
            <Button
              color='neutral'
              size='sm'
              variant='outline'
            >
              {model.mode === 'change' ? m.change : m.set}
            </Button>
          }
        />
      }
    />
  );
}
