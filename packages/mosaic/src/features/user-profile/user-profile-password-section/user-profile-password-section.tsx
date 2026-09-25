import type { ReactNode } from 'react';
import { useCallback, useRef } from 'react';

import { Button } from '../../../components/button';
import type { FieldFeedback } from '../../../components/form';
import { Text } from '../../../components/text';
import { useLocale, useMessages } from '../../../localization';
import { useReverificationFlow } from '../../reverification';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from './user-profile-edit-password.dialog';
import {
  passwordComplexityMessage,
  passwordFormError,
  passwordStrengthMessage,
} from './user-profile-password-feedback';
import type { UserProfilePasswordModel } from './user-profile-password-section.model';
import { useUserProfilePasswordModel } from './user-profile-password-section.model';
import { UserProfilePasswordSectionView } from './user-profile-password-section.view';

export interface UserProfilePasswordSectionProps {
  fallback?: ReactNode;
}

export function UserProfilePasswordSection({ fallback = null }: UserProfilePasswordSectionProps) {
  const currentModel = useUserProfilePasswordModel();
  const settledModel = useRef<UserProfilePasswordModel>(currentModel);
  if (currentModel.status !== 'loading') {
    settledModel.current = currentModel;
  }
  const model = currentModel.status === 'loading' ? settledModel.current : currentModel;
  const m = useMessages('userProfilePasswordSection');
  if (model.status === 'loading') {
    return fallback;
  }
  if (model.status === 'readonly') {
    return (
      <UserProfilePasswordSectionView
        hasPassword={model.mode === 'change'}
        action={<Text size='sm'>{m.readonly}</Text>}
      />
    );
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <PasswordFlow
      key={`${model.userId}:${model.sessionId}`}
      model={model}
    />
  );
}

function PasswordFlow({ model }: { model: Extract<UserProfilePasswordModel, { status: 'ready' }> }) {
  const m = useMessages('userProfilePasswordSection');
  const locale = useLocale();
  const [updatePassword, reverification] = useReverificationFlow(model.updatePassword);
  const { validatePassword, passwordSettings } = model;
  const feedback = useCallback(
    async (password: string): Promise<FieldFeedback | undefined> => {
      const { complexity, strength } = await validatePassword(password);
      const failures = Object.entries(complexity ?? {})
        .filter(([, failed]) => failed)
        .map(([code]) => code);
      const message = passwordComplexityMessage(failures, passwordSettings, m, locale);
      if (message) {
        return { type: complexity?.min_length ? 'info' : 'error', message };
      }
      if (strength?.state === 'fail') {
        return { type: 'error', message: passwordStrengthMessage(strength.result.feedback.suggestions, m) };
      }
      if (strength?.state === 'pass') {
        return { type: 'warning', message: m.rules.stronger };
      }
      return { type: 'success', message: m.rules.strong };
    },
    [validatePassword, passwordSettings, m, locale],
  );
  const controller = useUserProfileEditPasswordController({
    validatePassword: feedback,
    requiresCurrentPassword: model.requiresCurrentPassword,
    onSubmit: updatePassword,
    formatError: error => passwordFormError(error, model.requiresCurrentPassword, passwordSettings, m, locale),
    reverification,
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
          reverification={controller.reverification}
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
