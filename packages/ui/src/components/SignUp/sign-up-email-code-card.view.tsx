import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

import { Flow, localizationKeys } from '../../customizables';
import type { SignUpEmailCodeViewProps } from './sign-up-code-verification.types';

export const SignUpEmailCodeCardView = ({
  prepare,
  action,
  goBack,
  emailAddress,
}: SignUpEmailCodeViewProps): JSX.Element => (
  <Flow.Part part='emailCode'>
    <VerificationCodeCard
      cardTitle={localizationKeys('signUp.emailCode.title')}
      cardSubtitle={localizationKeys('signUp.emailCode.subtitle')}
      resendButton={localizationKeys('signUp.emailCode.resendButton')}
      identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
      onResendCodeClicked={() => void prepare()}
      onCodeEntryFinishedAction={action}
      onIdentityPreviewEditClicked={() => void goBack()}
      safeIdentifier={emailAddress}
    />
  </Flow.Part>
);
