import { AuthIdentityPreview } from '../../../blocks/auth';
import { VerificationCode, verificationResend } from '../../../blocks/verification';
import { useMessages } from '../../../localization';
import type { SignUpCode, SignUpVerifyScreen } from '../sign-up.types';
import { signUpCodeCopy, signUpCodeIdentity, signUpCodeSecondaryAction } from '../sign-up.utils';
import { useSignUpVerifyController } from './sign-up-verify.controller';

interface SignUpVerifyProps extends SignUpVerifyScreen {
  channel: 'email' | 'phone';
}

export function SignUpVerify({ channel, onEditIdentifier, onCancel, ...options }: SignUpVerifyProps) {
  const m = useMessages('signUp');
  const {
    value,
    onValueChange,
    errorMessage,
    globalErrorMessage,
    isPending,
    canEditIdentifier,
    onSubmit,
    onComplete,
    onResend,
    onSendSms,
    canResend,
    resendRemainingSeconds,
  } = useSignUpVerifyController(options);
  const step: SignUpCode = {
    purpose: channel === 'email' ? 'verify-email' : 'verify-phone',
    identifier: options.verification.target,
    provider: options.verification.provider,
  };
  const secondary = signUpCodeSecondaryAction(step, m, onSendSms ?? onCancel);
  const identity = signUpCodeIdentity(step, m);

  return (
    <VerificationCode
      messages={{
        ...signUpCodeCopy(step, m),
        secondaryActionLabel: secondary.label,
        primaryActionLabel: m.submit,
        pendingLabel: m.verifying,
      }}
      resend={verificationResend(channel === 'email' ? m.verifyEmail : m.verifyPhone, {
        onResend,
        canResend,
        remainingSeconds: resendRemainingSeconds,
      })}
      identity={
        identity.identifier ? (
          <AuthIdentityPreview
            identifier={identity.identifier}
            editLabel={identity.editLabel}
            disabled={!canEditIdentifier}
            onEdit={onEditIdentifier}
          />
        ) : undefined
      }
      value={value}
      onValueChange={onValueChange}
      errorMessage={errorMessage}
      globalErrorMessage={globalErrorMessage}
      isPending={isPending}
      onSubmit={onSubmit}
      onComplete={onComplete}
      onCancel={secondary.onClick}
    />
  );
}
