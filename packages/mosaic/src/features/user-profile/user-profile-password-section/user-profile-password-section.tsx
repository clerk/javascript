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
  return passwordSectionNode(model, fallback);
}

export function passwordSectionNode(model: UserProfilePasswordModel, fallback: ReactNode = null): ReactNode {
  if (model.status === 'loading') {
    return fallback;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return <UserProfilePasswordSectionContent model={model} />;
}

function UserProfilePasswordSectionContent({
  model,
}: {
  model: Extract<UserProfilePasswordModel, { status: 'ready' | 'readonly' }>;
}) {
  const m = useMessages('userProfilePasswordSection');
  if (model.status === 'readonly') {
    return (
      <UserProfilePasswordSectionView
        hasPassword={model.mode === 'change'}
        managedBy={{ name: model.managedBy.name ?? m.enterpriseConnection }}
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
  const controller = useUserProfileEditPasswordController({
    hasPassword: model.mode === 'change',
    requiresCurrentPassword: model.requiresCurrentPassword,
    identifier: model.identifier,
    validatePassword: model.validatePassword,
    onSubmit: model.updatePassword,
  });

  return (
    <UserProfilePasswordSectionView
      hasPassword={controller.hasPassword}
      action={
        <UserProfileEditPasswordDialog
          form={controller.form}
          passwordFeedback={controller.passwordFeedback}
          identifier={controller.identifier}
          open={controller.isOpen}
          onOpenChange={controller.onOpenChange}
          hasPassword={controller.hasPassword}
          requiresCurrentPassword={controller.requiresCurrentPassword}
          trigger={
            <Button
              color='neutral'
              size='sm'
              variant='outline'
            >
              {controller.hasPassword ? m.change : m.set}
            </Button>
          }
        />
      }
    />
  );
}
