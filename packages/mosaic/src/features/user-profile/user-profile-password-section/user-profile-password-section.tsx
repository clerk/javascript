import type { ReactNode } from 'react';

import { Button } from '../../../components/button';
import { useMessages } from '../../../localization';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from './user-profile-edit-password.dialog';
import type { UserProfilePasswordModel } from './user-profile-password-section.model';
import { useUserProfilePasswordModel } from './user-profile-password-section.model';
import type { UserProfilePasswordSlot } from './user-profile-password-section.types';
import { UserProfilePasswordSectionView } from './user-profile-password-section.view';

export interface UserProfilePasswordSectionProps {
  fallback?: ReactNode;
}

export function UserProfilePasswordSection(props: UserProfilePasswordSectionProps) {
  return useUserProfilePasswordSlot(props)?.content ?? null;
}

export function useUserProfilePasswordSlot({
  fallback = null,
}: UserProfilePasswordSectionProps = {}): UserProfilePasswordSlot | null {
  const model = useUserProfilePasswordModel();
  const m = useMessages('userProfilePasswordSection');
  if (model.status === 'loading') {
    // TODO: Add a password section skeleton as the default loading fallback.
    return fallback ? { content: fallback } : null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  if (model.status === 'readonly') {
    return {
      content: (
        <UserProfilePasswordSectionView
          hasPassword={model.mode === 'change'}
          managedBy={{ name: model.managedBy.name ?? m.enterpriseConnection }}
        />
      ),
    };
  }
  return {
    content: (
      <PasswordEditor
        key={`${model.userId}:${model.sessionId}`}
        model={model}
      />
    ),
  };
}

function PasswordEditor({ model }: { model: Extract<UserProfilePasswordModel, { status: 'ready' }> }) {
  const m = useMessages('userProfilePasswordSection');
  const controller = useUserProfileEditPasswordController({
    validatePassword: model.validatePassword,
    requiresCurrentPassword: model.requiresCurrentPassword,
    onSubmit: model.updatePassword,
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
