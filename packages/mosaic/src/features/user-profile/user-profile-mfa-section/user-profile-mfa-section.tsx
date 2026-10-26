import { type ReactNode, useRef } from 'react';

import { UserProfileAddMfaDialog } from './user-profile-add-mfa.dialog';
import { useUserProfileMfaController } from './user-profile-mfa-section.controller';
import { useUserProfileMfaModel } from './user-profile-mfa-section.model';
import type { UserProfileMfaModel } from './user-profile-mfa-section.types';
import { UserProfileMfaSectionView } from './user-profile-mfa-section.view';
import { UserProfileMfaSetupView } from './user-profile-mfa-setup.view';

export interface UserProfileMfaSectionProps {
  fallback?: ReactNode;
}

export function UserProfileMfaSection(props: UserProfileMfaSectionProps = {}) {
  const model = useUserProfileMfaModel();
  return mfaSectionNode(model, props.fallback);
}

export function mfaSectionNode(model: UserProfileMfaModel, fallback: ReactNode = null): ReactNode {
  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <MfaEditor
      key={`${model.userId}:${model.sessionId}`}
      model={model}
    />
  );
}

function MfaEditor({ model }: { model: Extract<UserProfileMfaModel, { status: 'ready' }> }) {
  const controller = useUserProfileMfaController(model);
  const initialFocusRef = useRef<HTMLElement>(null);
  const reverifying = controller.setupProps.step === 'verify';

  return (
    <UserProfileMfaSectionView
      {...controller.sectionProps}
      addControl={
        controller.showAddControl ? (
          <UserProfileAddMfaDialog
            open={controller.dialogOpen}
            disabled={controller.isPending}
            onOpenChange={controller.onDialogOpenChange}
            hideTrigger={!controller.showAddTrigger}
            reverifying={reverifying}
            showCloseButton={controller.showCloseButton}
            initialFocus={
              reverifying && controller.setupProps.reverification.status !== 'error' ? initialFocusRef : undefined
            }
          >
            <UserProfileMfaSetupView
              {...controller.setupProps}
              initialFocusRef={initialFocusRef}
              onReverificationClose={() => controller.onDialogOpenChange(false)}
            />
          </UserProfileAddMfaDialog>
        ) : undefined
      }
    />
  );
}
