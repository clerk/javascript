import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { Spinner } from '../../components/spinner';
import type { IconName } from '../../icons/registry';
import type { MosaicMessages } from '../../localization';
import { fill, useMessages } from '../../localization';
import { styles } from './reverification.styles';
import type { ReverificationMethod, ReverificationOtpChannel, ReverificationViewProps } from './reverification.types';
import { ReverificationBackupCode } from './steps/reverification-backup-code';
import { ReverificationHelp } from './steps/reverification-help';
import { ReverificationMethodPicker } from './steps/reverification-method-picker';
import { ReverificationOTP } from './steps/reverification-otp';
import { ReverificationPasskey } from './steps/reverification-passkey';
import { ReverificationPassword } from './steps/reverification-password';

type Messages = MosaicMessages['reverification'];

const methodIcon = {
  password: 'security-lock-square',
  passkey: 'security-passkey',
  email_code: 'code',
  phone_code: 'security-phone',
  totp: 'security-lock-square',
  backup_code: 'security-phone',
} as const satisfies Record<ReverificationMethod['strategy'], IconName>;

function methodLabel(method: ReverificationMethod, m: Messages): string {
  const identifier = 'identifier' in method ? method.identifier : '';
  switch (method.strategy) {
    case 'password':
      return m.alternativeMethods.blockButton__password;
    case 'passkey':
      return m.alternativeMethods.blockButton__passkey;
    case 'email_code':
      return fill(m.alternativeMethods.blockButton__emailCode, { identifier });
    case 'phone_code':
      return fill(m.alternativeMethods.blockButton__phoneCode, { identifier });
    case 'totp':
      return m.alternativeMethods.blockButton__totp;
    case 'backup_code':
      return m.alternativeMethods.blockButton__backupCode;
  }
}

// Lives here but is rendered by the wrapper parent
export function ReverificationUnavailable() {
  const m = useMessages('reverification');

  return (
    <Card.Header>
      <Card.Title>{m.unavailable.title}</Card.Title>
      <Card.Description>{m.unavailable.description}</Card.Description>
    </Card.Header>
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
          {m.formButtonPrimary}
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
  return m.totpMfa;
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
  embedded = false,
}: ReverificationViewProps): JSX.Element {
  const m = useMessages('reverification');

  const otp = otpCopy(otpChannel, m);
  const actions = {
    secondaryActionLabel: m.footerActionLink__useAnotherMethod,
    primaryActionLabel: m.formButtonPrimary,
    pendingLabel: m.verifying,
  };
  const hasAlternatives = methods.length > 0;
  const resendLabel = otpChannel === 'phone' ? m.phoneCode.resendButton : m.emailCode.resendButton;
  const resend =
    otpChannel === 'email' || otpChannel === 'phone'
      ? {
        label: resendRemainingSeconds ? `${resendLabel} (${resendRemainingSeconds})` : resendLabel,
        disabled: !canResend || isPending,
        onClick: onResend,
      }
      : undefined;

  const flow = (
    <Flow.Root
      value={step}
      direction={direction}
      state={step}
    >
      {() => (
        <>
          <Flow.Step ids={['password']}>
            <ReverificationPassword
              messages={{
                title: m.password.title,
                description: m.password.description,
                fieldLabel: m.formFieldLabel__password,
                fieldPlaceholder: m.formFieldInputPlaceholder__password,
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
              messages={{
                title: otp.title,
                description: otp.description,
                fieldLabel: otp.formTitle,
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
              messages={{
                title: m.backupCodeMfa.title,
                description: m.backupCodeMfa.description,
                fieldLabel: m.formFieldLabel__backupCode,
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
              messages={{
                title: m.alternativeMethods.title,
                description: m.alternativeMethods.description,
                backButton: m.backButton,
                helpText: m.alternativeMethods.actionText,
                helpButton: m.alternativeMethods.actionLink,
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
                title: m.alternativeMethods.getHelp.title,
                description: m.alternativeMethods.getHelp.description,
                backButton: m.backButton,
                supportButton: m.alternativeMethods.getHelp.blockButton__emailSupport,
              }}
              onEmailSupport={onEmailSupport}
              onBack={onBack}
            />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );

  if (embedded) {
    return flow;
  }

  // The wrapper always renders the view as embedded, so this case should only
  // happen when rendering the view standalone (e.g. for swingset)
  return <Card.Root renderBranding={false}>{flow}</Card.Root>;
}
