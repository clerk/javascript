import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Flow, useFlowAutoFocus } from '../../../components/flow';
import type { ReverificationController } from '../../reverification';
import { Reverification } from '../../reverification';
import type { UserProfileAddAuthenticatorViewProps } from './user-profile-add-authenticator.view';
import { UserProfileAddAuthenticatorView } from './user-profile-add-authenticator.view';
import type { UserProfileAddMfaViewProps } from './user-profile-add-mfa.view';
import { UserProfileAddMfaView } from './user-profile-add-mfa.view';
import type { UserProfileAddSmsViewProps } from './user-profile-add-sms.view';
import { UserProfileAddSmsView } from './user-profile-add-sms.view';
import type { UserProfileBackupCodesViewProps } from './user-profile-backup-codes.view';
import { UserProfileBackupCodesView } from './user-profile-backup-codes.view';
import type { UserProfileMfaAddableMethod } from './user-profile-mfa-section.types';

export interface UserProfileMfaSetupViewProps extends UserProfileAddMfaViewProps {
  step: UserProfileMfaAddableMethod | 'select' | 'verify';
  reverification: ReverificationController;
  initialFocusRef?: Ref<HTMLElement>;
  onReverificationClose?: () => void;
  sms: UserProfileAddSmsViewProps;
  authenticator?: Omit<UserProfileAddAuthenticatorViewProps, 'onBack'>;
  backupCodes: Omit<UserProfileBackupCodesViewProps, 'onCancel'>;
  onBack: () => void;
  onCancel: () => void;
}

export function UserProfileMfaSetupView(props: UserProfileMfaSetupViewProps) {
  return (
    <Flow.Root
      value={props.step}
      direction={props.step === 'select' ? -1 : 1}
      state={props}
    >
      {current => (
        <>
          <Flow.Step ids={['select']}>
            <UserProfileAddMfaView
              methods={current.methods}
              pendingMethod={current.pendingMethod}
              errorMessage={current.errorMessage}
              onSelect={current.onSelect}
            />
          </Flow.Step>
          <Flow.Step ids={['sms']}>
            <UserProfileAddSmsView {...current.sms} />
          </Flow.Step>
          <Flow.Step ids={['authenticator']}>
            {current.authenticator ? (
              <UserProfileAddAuthenticatorView
                {...current.authenticator}
                onBack={current.onBack}
              />
            ) : null}
          </Flow.Step>
          <Flow.Step ids={['backup-codes']}>
            <UserProfileBackupCodesView
              {...current.backupCodes}
              onCancel={current.onCancel}
            />
          </Flow.Step>
          <Flow.Step ids={['verify']}>
            <ReverifyStep
              controller={current.reverification}
              initialFocusRef={current.initialFocusRef}
              onClose={current.onReverificationClose}
            />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}

function ReverifyStep(props: {
  controller: ReverificationController;
  initialFocusRef?: Ref<HTMLElement>;
  onClose?: () => void;
}) {
  const flowFocusRef = useFlowAutoFocus<HTMLElement>();
  const initialFocusRef = useMergeRefs([flowFocusRef, props.initialFocusRef]);

  return (
    <Reverification
      {...props}
      initialFocusRef={initialFocusRef}
    />
  );
}
