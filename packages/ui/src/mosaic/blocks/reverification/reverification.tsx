import { Card } from '../../components/card';
import type { FlowDirection } from '../../components/flow';
import { Flow } from '../../components/flow';
import type { ReverificationBackupCodeProps } from './reverification-backup-code';
import { ReverificationBackupCode } from './reverification-backup-code';
import type { ReverificationHelpProps } from './reverification-help';
import { ReverificationHelp } from './reverification-help';
import type { ReverificationMethodPickerProps } from './reverification-method-picker';
import { ReverificationMethodPicker } from './reverification-method-picker';
import type { ReverificationOTPProps } from './reverification-otp';
import { ReverificationOTP } from './reverification-otp';
import type { ReverificationPasskeyProps } from './reverification-passkey';
import { ReverificationPasskey } from './reverification-passkey';
import type { ReverificationPasswordProps } from './reverification-password';
import { ReverificationPassword } from './reverification-password';

export type ReverificationStatus = 'password' | 'passkey' | 'otp' | 'backup-code' | 'method-picker' | 'help';

export interface ReverificationState {
  status: ReverificationStatus;
  password: ReverificationPasswordProps;
  passkey: ReverificationPasskeyProps;
  otp: ReverificationOTPProps;
  backupCode: ReverificationBackupCodeProps;
  methodPicker: ReverificationMethodPickerProps;
  help: ReverificationHelpProps;
}

export interface ReverificationProps {
  state: ReverificationState;
  direction?: FlowDirection;
}

export function Reverification({ state, direction }: ReverificationProps): JSX.Element {
  return (
    <Card.Root>
      <Flow.Root
        value={state.status}
        direction={direction}
        state={state}
      >
        {current => (
          <>
            <Flow.Step ids={['password']}>
              <ReverificationPassword {...current.password} />
            </Flow.Step>

            <Flow.Step ids={['passkey']}>
              <ReverificationPasskey {...current.passkey} />
            </Flow.Step>

            <Flow.Step ids={['otp']}>
              <ReverificationOTP {...current.otp} />
            </Flow.Step>

            <Flow.Step ids={['backup-code']}>
              <ReverificationBackupCode {...current.backupCode} />
            </Flow.Step>

            <Flow.Step ids={['method-picker']}>
              <ReverificationMethodPicker {...current.methodPicker} />
            </Flow.Step>

            <Flow.Step ids={['help']}>
              <ReverificationHelp {...current.help} />
            </Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}
