import type { ReactNode } from 'react';

import { Reverification } from '../../reverification/reverification';
import { useReverificationController } from '../../reverification/reverification.controller';
import { useReverificationModel } from '../../reverification/reverification.model';
import { UserProfileAddMfaDialog } from './user-profile-add-mfa.dialog';
import { useUserProfileMfaController } from './user-profile-mfa-section.controller';
import { useUserProfileMfaModel } from './user-profile-mfa-section.model';
import type { UserProfileMfaModel } from './user-profile-mfa-section.types';
import { UserProfileMfaSectionView } from './user-profile-mfa-section.view';
import { UserProfileMfaSetupView } from './user-profile-mfa-setup.view';

export interface UserProfileMfaSectionProps {
  fallback?: ReactNode;
}

export interface UserProfileMfaSlot {
  content: ReactNode;
}

export function UserProfileMfaSection(props: UserProfileMfaSectionProps = {}) {
  return useUserProfileMfaSlot(props)?.content ?? null;
}

export function useUserProfileMfaSlot({ fallback = null }: UserProfileMfaSectionProps = {}): UserProfileMfaSlot | null {
  const model = useUserProfileMfaModel();
  if (model.status === 'loading') {
    return fallback ? { content: fallback } : null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return {
    content: (
      <MfaEditor
        key={`${model.userId}:${model.sessionId}`}
        model={model}
      />
    ),
  };
}

function MfaEditor({ model }: { model: Extract<UserProfileMfaModel, { status: 'ready' }> }) {
  const controller = useUserProfileMfaController(model);
  const reverificationModel = useReverificationModel(model.reverification);
  const reverificationController = useReverificationController(reverificationModel, model.resetReverification);
  const separateReverification =
    !controller.dialogOpen && (model.reverification.phase === 'active' || model.reverification.phase === 'retrying');

  return (
    <>
      <UserProfileMfaSectionView
        {...controller.sectionProps}
        addControl={
          controller.showAddTrigger || controller.dialogOpen ? (
            <UserProfileAddMfaDialog
              open={controller.dialogOpen}
              onOpenChange={controller.onDialogOpenChange}
              hideTrigger={!controller.showAddTrigger}
            >
              {model.reverification.phase === 'active' || model.reverification.phase === 'retrying' ? (
                <Reverification {...reverificationController} />
              ) : (
                <UserProfileMfaSetupView {...controller.setupProps} />
              )}
            </UserProfileAddMfaDialog>
          ) : undefined
        }
      />
      <UserProfileAddMfaDialog
        open={separateReverification}
        onOpenChange={open => {
          if (!open && model.reverification.phase === 'active') {
            model.reverification.cancel();
          }
        }}
        hideTrigger
      >
        <Reverification {...reverificationController} />
      </UserProfileAddMfaDialog>
    </>
  );
}
