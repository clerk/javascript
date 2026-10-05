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

export function passwordSectionNode(model: UserProfilePasswordModel, fallback: ReactNode): ReactNode {
  if (model.status === 'loading') {
    // TODO: After https://github.com/clerk/javascript/pull/10029 lands, add the password skeleton using the shared section primitives. Keep loading timing in the connected security panel and omit the section when passwords are unavailable.
    return fallback;
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
  const controller = useUserProfileEditPasswordController({
    policy: model,
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
