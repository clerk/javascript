import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

type UVFactorOneCodeViewProps = Pick<
  VerificationCodeCardProps,
  | 'cardTitle'
  | 'cardSubtitle'
  | 'inputLabel'
  | 'resendButton'
  | 'identityPreviewEditButtonAriaLabel'
  | 'onShowAlternativeMethodsClicked'
  | 'showAlternativeMethods'
  | 'onBackLinkClicked'
  | 'safeIdentifier'
  | 'profileImageUrl'
> & {
  action: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  prepare: () => void;
};

export const UVFactorOneCodeView = ({ action, prepare, ...props }: UVFactorOneCodeViewProps) => (
  <VerificationCodeCard
    cardTitle={props.cardTitle}
    cardSubtitle={props.cardSubtitle}
    inputLabel={props.inputLabel}
    resendButton={props.resendButton}
    onCodeEntryFinishedAction={action}
    onResendCodeClicked={prepare}
    safeIdentifier={props.safeIdentifier}
    profileImageUrl={props.profileImageUrl}
    identityPreviewEditButtonAriaLabel={props.identityPreviewEditButtonAriaLabel}
    onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    showAlternativeMethods={props.showAlternativeMethods}
    onBackLinkClicked={props.onBackLinkClicked}
  />
);
