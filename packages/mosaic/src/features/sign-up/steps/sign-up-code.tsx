import { AuthIdentityPreview } from '../../../blocks/auth';
import { VerificationCode, verificationResend } from '../../../blocks/verification';
import { useMessages } from '../../../localization';
import type { SignUpCode } from '../sign-up.types';
import { signUpCodeCopy, signUpCodeIdentity, signUpCodeSecondaryAction } from '../sign-up.utils';

interface SignUpCodeStepProps {
  step: SignUpCode;
  value: string;
  onValueChange: (value: string) => void;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onComplete: (code: string) => void;
  onEditIdentifier: () => void;
  onCancel?: () => void;
  onResend?: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
}

export function SignUpCodeStep({
  step,
  value,
  onValueChange,
  errorMessage,
  globalErrorMessage,
  isPending,
  onSubmit,
  onComplete,
  onEditIdentifier,
  onCancel,
  onResend,
  canResend,
  resendRemainingSeconds,
}: SignUpCodeStepProps) {
  const m = useMessages('signUp');
  const secondary = signUpCodeSecondaryAction(step, m, onCancel);
  const identity = signUpCodeIdentity(step, m);

  return (
    <VerificationCode
      messages={{
        ...signUpCodeCopy(step, m),
        secondaryActionLabel: secondary.label,
        primaryActionLabel: m.submit,
        pendingLabel: m.verifying,
      }}
      resend={verificationResend(step.purpose === 'verify-email' ? m.verifyEmail : m.verifyPhone, {
        onResend,
        canResend,
        remainingSeconds: resendRemainingSeconds,
      })}
      identity={
        identity.identifier ? (
          <AuthIdentityPreview
            identifier={identity.identifier}
            editLabel={identity.editLabel}
            disabled={isPending}
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
