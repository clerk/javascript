import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

type UVFactorTwoCodeViewProps = Pick<
  VerificationCodeCardProps,
  | 'cardTitle'
  | 'cardSubtitle'
  | 'resendButton'
  | 'inputLabel'
  | 'safeIdentifier'
  | 'profileImageUrl'
  | 'identityPreviewEditButtonAriaLabel'
  | 'onShowAlternativeMethodsClicked'
  | 'showAlternativeMethods'
> & {
  action: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  prepare: VerificationCodeCardProps['onResendCodeClicked'];
};

export const UVFactorTwoCodeView = ({ action, prepare, ...props }: UVFactorTwoCodeViewProps) => (
  <VerificationCodeCard
    cardTitle={props.cardTitle}
    cardSubtitle={props.cardSubtitle}
    resendButton={props.resendButton}
    inputLabel={props.inputLabel}
    onCodeEntryFinishedAction={action}
    onResendCodeClicked={prepare}
    safeIdentifier={props.safeIdentifier}
    profileImageUrl={props.profileImageUrl}
    identityPreviewEditButtonAriaLabel={props.identityPreviewEditButtonAriaLabel}
    onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    showAlternativeMethods={props.showAlternativeMethods}
  />
);
