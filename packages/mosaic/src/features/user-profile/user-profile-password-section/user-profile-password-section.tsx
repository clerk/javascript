import { isReverificationHint } from '@clerk/shared/authorization-errors';
import { isReverificationCancelledError } from '@clerk/shared/error';
import type { ReactNode } from 'react';
import { useCallback, useRef } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import type { FieldFeedback } from '../../../components/form';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { Reverification, useReverificationFlow } from '../../reverification';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from './user-profile-edit-password.dialog';
import type { UserProfilePasswordModel } from './user-profile-password-section.model';
import { passwordFormError, useUserProfilePasswordModel } from './user-profile-password-section.model';
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
  const [updatePassword, verification] = useReverificationFlow(model.updatePassword);
  const { validatePassword, passwordSettings } = model;
  const feedback = useCallback(
    async (password: string): Promise<FieldFeedback | undefined> => {
      const { complexity, strength } = await validatePassword(password);
      if (complexity?.min_length) {
        return { type: 'info', message: fill(m.rules.minLength, { length: passwordSettings.min_length }) };
      }
      const messages = [
        complexity?.max_length && fill(m.rules.maxLength, { length: passwordSettings.max_length }),
        complexity?.require_lowercase && m.rules.lowercase,
        complexity?.require_uppercase && m.rules.uppercase,
        complexity?.require_numbers && m.rules.number,
        complexity?.require_special_char && m.rules.special,
      ].filter(Boolean);
      if (messages.length > 0) {
        return { type: 'error', message: messages.join(' ') };
      }
      if (strength?.state === 'fail') {
        return { type: 'error', message: m.rules.weak };
      }
      if (strength?.state === 'pass') {
        return { type: 'warning', message: m.rules.stronger };
      }
      return strength ? { type: 'success', message: m.rules.strong } : undefined;
    },
    [validatePassword, passwordSettings, m],
  );
  const controller = useUserProfileEditPasswordController({
    validatePassword: feedback,
    requiresCurrentPassword: model.requiresCurrentPassword,
    onSubmit: async value => {
      try {
        const result = await updatePassword(value);
        if (isReverificationHint(result)) {
          throw new Error(m.errors.verificationIncomplete);
        }
        return { status: 'saved' };
      } catch (error) {
        if (isReverificationCancelledError(error)) {
          return { status: 'cancelled' };
        }
        throw passwordFormError(error, model.requiresCurrentPassword);
      }
    },
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
          onOpenChange={open => {
            if (!open && verification.status !== 'idle') {
              verification.onCancel?.();
              return;
            }
            controller.onOpenChange(open);
          }}
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
        >
          {verification.status !== 'idle' ? (
            <>
              <Reverification {...verification} />
              <Card.Footer>
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                  disabled={verification.phase === 'retrying'}
                  onClick={verification.onCancel}
                >
                  {m.back}
                </Button>
              </Card.Footer>
            </>
          ) : undefined}
        </UserProfileEditPasswordDialog>
      }
    />
  );
}
