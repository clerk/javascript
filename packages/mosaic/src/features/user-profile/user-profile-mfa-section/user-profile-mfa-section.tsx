import type { ReactNode } from 'react';

import { Reverification } from '../../reverification/reverification';
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

export function UserProfileMfaSection(props: UserProfileMfaSectionProps = {}) {
  const model = useUserProfileMfaModel();
  return mfaSectionNode(model, props.fallback);
}

export function mfaSectionNode(model: UserProfileMfaModel, fallback: ReactNode = null): ReactNode {
  if (model.status === 'loading') {
    return fallback || null;
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
  const reverificationModel = useReverificationModel(model.reverification);
  const controller = useUserProfileMfaController(model, reverificationModel);

  return (
    <>
      <UserProfileMfaSectionView
        {...controller.sectionProps}
        addControl={
          controller.showAddControl ? (
            <UserProfileAddMfaDialog
              open={controller.dialogOpen}
              onOpenChange={controller.onDialogOpenChange}
              hideTrigger={!controller.showAddTrigger}
            >
              {controller.showReverification ? (
                <Reverification {...controller.reverificationProps} />
              ) : (
                <UserProfileMfaSetupView {...controller.setupProps} />
              )}
            </UserProfileAddMfaDialog>
          ) : undefined
        }
      />
      <UserProfileAddMfaDialog
        open={controller.separateReverificationOpen}
        onOpenChange={controller.onSeparateReverificationOpenChange}
        hideTrigger
      >
        <Reverification {...controller.reverificationProps} />
      </UserProfileAddMfaDialog>
    </>
  );
}
