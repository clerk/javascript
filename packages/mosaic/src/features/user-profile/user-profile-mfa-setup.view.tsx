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
  sms: Omit<UserProfileAddSmsViewProps, 'onCancel'>;
  authenticator: Omit<UserProfileAddAuthenticatorViewProps, 'onCancel'>;
  backupCodes: Omit<UserProfileBackupCodesViewProps, 'onCancel'>;
  onCancel: () => void;
}

export function UserProfileMfaSetupView(props: UserProfileMfaSetupViewProps) {
  return (
    <Flow.Root
      value={props.step}
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
            <UserProfileAddSmsView
              {...current.sms}
              onCancel={current.onCancel}
            />
          </Flow.Step>
          <Flow.Step ids={['authenticator']}>
            <UserProfileAddAuthenticatorView
              {...current.authenticator}
              onCancel={current.onCancel}
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
