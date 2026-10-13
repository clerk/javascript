import type { ReactNode } from 'react';

import { Button } from '../../../components/button';
import { useMessages } from '../../../localization';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import { UserProfileEditPasswordDialog } from './user-profile-edit-password.dialog';
import type { UserProfilePasswordModel } from './user-profile-password-section.model';
import { useUserProfilePasswordModel } from './user-profile-password-section.model';
import { UserProfilePasswordSectionView } from './user-profile-password-section.view';

export interface UserProfilePasswordSectionProps {
  fallback?: ReactNode;
}

export function UserProfilePasswordSection({ fallback = null }: UserProfilePasswordSectionProps) {
  const model = useUserProfilePasswordModel();
  return renderPasswordSection(model, fallback);
}

export function renderPasswordSection(model: UserProfilePasswordModel, fallback: ReactNode): ReactNode {
  if (model.status === 'loading') {
    return fallback || null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  if (model.status === 'readonly') {
    return (
      <UserProfilePasswordSectionView
        hasPassword={model.mode === 'change'}
        managedBy={model.managedBy}
      />
    );
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
  const hasPassword = model.mode === 'change';
  const controller = useUserProfileEditPasswordController({
    policy: model,
    validatePassword: model.validatePassword,
    onSubmit: model.updatePassword,
  });

  return (
    <UserProfilePasswordSectionView
      hasPassword={hasPassword}
      action={
        <UserProfileEditPasswordDialog
          form={controller.form}
          passwordFeedback={controller.passwordFeedback}
          identifier={model.identifier}
          open={controller.isOpen}
          onOpenChange={controller.onOpenChange}
          hasPassword={hasPassword}
          requiresCurrentPassword={model.requiresCurrentPassword}
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
      }
    />
  );
}
