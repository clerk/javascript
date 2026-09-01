import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import type { IconName } from '../../icons/registry';
import { ReverificationBackupCode } from './panels/reverification-backup-code';
import { ReverificationHelp } from './panels/reverification-help';
import { ReverificationMethodPicker } from './panels/reverification-method-picker';
import { ReverificationOTP } from './panels/reverification-otp';
import { ReverificationPasskey } from './panels/reverification-passkey';
import { ReverificationPassword } from './panels/reverification-password';
import { fill, reverificationBase as m } from './reverification.messages';
import type { ReverificationMethod, ReverificationOtpChannel, ReverificationViewProps } from './reverification.types';

const actions = {
  secondaryActionLabel: m.footerActionLink__useAnotherMethod,
  primaryActionLabel: m.formButtonPrimary,
  pendingLabel: m.verifying,
};

const methodIcon = {
  password: 'security-lock-square',
  passkey: 'security-passkey',
  email_code: 'code',
  phone_code: 'security-phone',
  totp: 'security-authenticator',
  backup_code: 'security-phone',
} as const satisfies Record<ReverificationMethod['strategy'], IconName>;

function methodLabel(method: ReverificationMethod): string {
  const identifier = method.identifier ?? '';
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

function otpCopy(channel: ReverificationOtpChannel | undefined) {
  if (channel === 'email') {
    return m.emailCode;
  }
  if (channel === 'phone') {
    return m.phoneCode;
  }
  return m.totpMfa;
}

export function ReverificationView(props: ReverificationViewProps): JSX.Element {
  const {
    step,
    direction,
    value,
    onValueChange,
    errorMessage,
    isPending,
    onSubmit,
    onVerifyPasskey,
    onShowMethods,
    onShowHelp,
    onBack,
    onEmailSupport,
    methods,
    onSelectMethod,
    otpChannel,
    onResend,
    canResend,
  } = props;

  const otp = otpCopy(otpChannel);

  return (
    <Card.Root renderBranding={false}>
      <Flow.Root
        value={step}
        direction={direction}
        state={props}
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
                onCancel={onShowMethods}
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
                onVerify={onVerifyPasskey}
                onCancel={onShowMethods}
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
                resend={
                  onResend
                    ? {
                        label: otpChannel === 'phone' ? m.phoneCode.resendButton : m.emailCode.resendButton,
                        disabled: !canResend || isPending,
                        onClick: onResend,
                      }
                    : undefined
                }
                onValueChange={onValueChange}
                onComplete={code => {
                  onValueChange(code);
                  onSubmit();
                }}
                onSubmit={onSubmit}
                onCancel={onShowMethods}
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
                onCancel={onShowMethods}
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
                  label: methodLabel(method),
                  icon: methodIcon[method.strategy],
                }))}
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
                onBack={onBack ?? (() => {})}
              />
            </Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}
