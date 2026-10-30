import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { Spinner } from '../../components/spinner';
import type { IconComponent } from '../../icons/glyph';
import { Code } from '../../icons/glyphs/code';
import { SecurityLockSquare } from '../../icons/glyphs/security-lock-square';
import { SecurityPasskey } from '../../icons/glyphs/security-passkey';
import { SecurityPhone } from '../../icons/glyphs/security-phone';
import type { MosaicMessages } from '../../localization';
import { fill, rich, useMessages } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import { styles } from './reverification.styles';
import type {
  ReverificationErrorReason,
  ReverificationMethod,
  ReverificationOtpChannel,
  ReverificationViewProps,
} from './reverification.types';
import { ReverificationBackupCode } from './steps/reverification-backup-code';
import { ReverificationHelp } from './steps/reverification-help';
import { ReverificationMethodPicker } from './steps/reverification-method-picker';
import { ReverificationOTP } from './steps/reverification-otp';
import { ReverificationPasskey } from './steps/reverification-passkey';
import { ReverificationPassword } from './steps/reverification-password';

type Messages = MosaicMessages['reverification'];

const methodIcon = {
  password: SecurityLockSquare,
  passkey: SecurityPasskey,
  email_code: Code,
  phone_code: SecurityPhone,
  totp: SecurityLockSquare,
  backup_code: SecurityPhone,
} as const satisfies Record<ReverificationMethod['strategy'], IconComponent>;

function methodLabel(method: ReverificationMethod, m: Messages): string {
  const identifier = 'identifier' in method ? method.identifier : '';
  switch (method.strategy) {
    case 'password':
      return m.methods.password;
    case 'passkey':
      return m.methods.passkey;
    case 'email_code':
      return fill(m.methods.emailCode, { identifier });
    case 'phone_code':
      return fill(m.methods.phoneCode, { identifier });
    case 'totp':
      return m.methods.totp;
    case 'backup_code':
      return m.methods.backupCode;
  }
}

// Lives here but is rendered by the wrapper parent
export function ReverificationError({ reason, onClose }: { reason: ReverificationErrorReason; onClose?: () => void }) {
  const m = useMessages('reverification');
  const copy = m.error[reason];

  return (
    <>
      <Card.Header>
        <Card.Title>{copy.title}</Card.Title>
        <Card.Description>{copy.description}</Card.Description>
      </Card.Header>
      {onClose ? (
        <Card.Footer>
          <Button
            type='button'
            variant='outline'
            color='neutral'
            fullWidth
            onClick={onClose}
          >
            {m.error.close}
          </Button>
        </Card.Footer>
      ) : null}
    </>
  );
}

// Lives here but is rendered by the wrapper parent
export function ReverificationPending() {
  const m = useMessages('reverification');

  return (
    <>
      <Card.Header>
        <Card.Title>{m.loading.title}</Card.Title>
      </Card.Header>
      <Card.Content
        aria-busy='true'
        xstyle={styles.pending}
      >
        <Spinner />
      </Card.Content>
      <Card.Footer>
        <Button
          type='button'
          disabled
          xstyle={styles.pendingAction}
        >
          {m.continue}
        </Button>
      </Card.Footer>
    </>
  );
}

function otpCopy(channel: ReverificationOtpChannel | undefined, m: Messages) {
  if (channel === 'email') {
    return m.emailCode;
  }
  if (channel === 'phone') {
    return m.phoneCode;
  }
  return m.totp;
}

export function ReverificationView({
  step,
  direction,
  value,
  onValueChange,
  errorMessage,
  isPending,
  onSubmit,
  onShowMethods,
  onShowHelp,
  onBack,
  onEmailSupport,
  methods,
  pendingMethodId,
  onSelectMethod,
  otpChannel,
  onResend,
  canResend,
  resendRemainingSeconds,
  focusRef,
}: ReverificationViewProps & { focusRef?: Ref<HTMLElement> }): JSX.Element {
  const m = useMessages('reverification');

  const otp = otpCopy(otpChannel, m);
  const actions = {
    secondaryActionLabel: m.useAnotherMethod,
    primaryActionLabel: m.continue,
    pendingLabel: m.verifying,
  };
  const hasAlternatives = methods.length > 0;
  const resendCopy = otpChannel === 'phone' ? m.phoneCode : m.emailCode;
  const resend =
    otpChannel === 'email' || otpChannel === 'phone'
      ? {
          text: resendCopy.resendText,
          label: resendRemainingSeconds ? (
            <span>
              {rich(resendCopy.resendCountdown, {
                values: {
                  seconds: <span {...stylex.props(tabularNumbersStyle.enabled)}>{resendRemainingSeconds}</span>,
                },
              })}
            </span>
          ) : (
            resendCopy.resend
          ),
          disabled: !canResend || isPending,
          onClick: onResend,
        }
      : undefined;

  return (
    <Flow.Root
      value={step}
      direction={direction}
      state={step}
    >
      {() => (
        <>
          <Flow.Step ids={['password']}>
            <ReverificationPassword
              focusRef={focusRef}
              messages={{
                title: m.password.title,
                description: m.password.description,
                fieldLabel: m.password.label,
                fieldPlaceholder: m.password.placeholder,
                showPasswordLabel: m.password.showPassword,
                hidePasswordLabel: m.password.hidePassword,
                ...actions,
              }}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              onValueChange={onValueChange}
              onSubmit={onSubmit}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['passkey']}>
            <ReverificationPasskey
              focusRef={focusRef}
              messages={{
                title: m.passkey.title,
                description: m.passkey.description,
                ...actions,
              }}
              errorMessage={errorMessage}
              isPending={isPending}
              onSubmit={onSubmit}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['otp']}>
            <ReverificationOTP
              focusRef={focusRef}
              messages={{
                title: otp.title,
                description: otp.description,
                fieldLabel: otp.label,
                ...actions,
              }}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              resend={resend}
              onValueChange={onValueChange}
              onComplete={code => {
                onValueChange(code);
                onSubmit();
              }}
              onSubmit={onSubmit}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['backup-code']}>
            <ReverificationBackupCode
              focusRef={focusRef}
              messages={{
                title: m.backupCode.title,
                description: m.backupCode.description,
                fieldLabel: m.backupCode.label,
                ...actions,
              }}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              onValueChange={onValueChange}
              onSubmit={onSubmit}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['method-picker']}>
            <ReverificationMethodPicker
              focusRef={focusRef}
              messages={{
                title: m.methods.title,
                description: m.methods.description,
                backButton: m.back,
                helpText: m.methods.helpText,
                helpButton: m.methods.help,
              }}
              methods={methods.map(method => ({
                id: method.id,
                label: methodLabel(method, m),
                icon: methodIcon[method.strategy],
              }))}
              pendingMethodId={pendingMethodId}
              onSelect={onSelectMethod}
              onHelp={onShowHelp}
              onBack={onBack}
            />
          </Flow.Step>

          <Flow.Step ids={['help']}>
            <ReverificationHelp
              messages={{
                title: m.help.title,
                description: m.help.description,
                backButton: m.back,
                supportButton: m.help.emailSupport,
              }}
              onEmailSupport={onEmailSupport}
              onBack={onBack}
            />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}
