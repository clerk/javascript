import { Flow } from '../../components/flow';
import type { UserProfileAddAuthenticatorViewProps } from './user-profile-add-authenticator.view';
import { UserProfileAddAuthenticatorView } from './user-profile-add-authenticator.view';
import type { UserProfileAddMfaViewProps } from './user-profile-add-mfa.view';
import { UserProfileAddMfaView } from './user-profile-add-mfa.view';
import type { UserProfileAddSmsViewProps } from './user-profile-add-sms.view';
import { UserProfileAddSmsView } from './user-profile-add-sms.view';
import type { UserProfileBackupCodesViewProps } from './user-profile-backup-codes.view';
import { UserProfileBackupCodesView } from './user-profile-backup-codes.view';
import type { UserProfileMfaAddableMethod } from './user-profile-mfa-section.view';

export interface UserProfileMfaSetupViewProps extends UserProfileAddMfaViewProps {
  step: UserProfileMfaAddableMethod | 'select';
  sms: UserProfileAddSmsViewProps;
  authenticator: Omit<UserProfileAddAuthenticatorViewProps, 'onBack'>;
  backupCodes: Omit<UserProfileBackupCodesViewProps, 'onCancel'>;
  onBack: () => void;
  onCancel: () => void;
}

export function UserProfileMfaSetupView(props: UserProfileMfaSetupViewProps) {
  const step = props.step === 'authenticator' && props.authenticator.setup ? 'authenticator-verify' : props.step;

  return (
    <Flow.Root
      value={step}
      direction={props.step === 'select' ? -1 : 1}
      state={props}
    >
      {current => (
        <>
          <Flow.Step ids={['select']}>
            <UserProfileAddMfaView
              methods={current.methods}
              onSelect={current.onSelect}
            />
          </Flow.Step>
          <Flow.Step ids={['sms']}>
            <UserProfileAddSmsView {...current.sms} />
          </Flow.Step>
          <Flow.Step ids={['authenticator']}>
            <UserProfileAddAuthenticatorView
              {...current.authenticator}
              onBack={current.onBack}
            />
          </Flow.Step>
          <Flow.Step ids={['authenticator-verify']}>
            <UserProfileAddAuthenticatorView
              {...current.authenticator}
              onBack={current.onBack}
            />
          </Flow.Step>
          <Flow.Step ids={['backup-codes']}>
            <UserProfileBackupCodesView
              {...current.backupCodes}
              onCancel={current.onCancel}
            />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}
