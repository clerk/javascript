import { type ReactNode, useRef, useState } from 'react';

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
  const [lastShownStep, setLastShownStep] = useState(controller.setupProps.step);
  const step = controller.isPending && lastShownStep === 'verify' ? 'verify' : controller.setupProps.step;
  if (step !== lastShownStep) {
    setLastShownStep(step);
  }
  const reverifying = step === 'verify';
  const onOpenChange = (open: boolean) => {
    if (!open && controller.showCloseButton) {
      setLastShownStep('select');
    }
    controller.onDialogOpenChange(open);
  };

  return (
    <UserProfileMfaSectionView
      {...controller.sectionProps}
      addControl={
        controller.showAddControl || reverifying ? (
          <UserProfileAddMfaDialog
            open={controller.dialogOpen || reverifying}
            disabled={controller.isPending}
            onOpenChange={onOpenChange}
            hideTrigger={!controller.showAddTrigger}
            reverifying={reverifying}
            showCloseButton={controller.showCloseButton}
            initialFocus={
              reverifying && controller.setupProps.reverification.status !== 'error' ? initialFocusRef : undefined
            }
          >
            <UserProfileMfaSetupView
              {...controller.setupProps}
              step={step}
              initialFocusRef={initialFocusRef}
              onReverificationClose={() => onOpenChange(false)}
            />
          </UserProfileAddMfaDialog>
        ) : undefined
      }
    />
  );
}
