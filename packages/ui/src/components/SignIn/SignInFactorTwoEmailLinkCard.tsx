import type { EmailLinkFactor } from '@clerk/shared/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import { useSignInEmailLinkController } from './sign-in-email-link.controller';
import { useSignInEmailLinkModel } from './sign-in-email-link.model';
import { SignInEmailLinkView } from './sign-in-email-link.view';

type SignInFactorTwoEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  showClientTrustNotice?: boolean;
  factor: EmailLinkFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export const SignInFactorTwoEmailLinkCard = (props: SignInFactorTwoEmailLinkCardProps) => {
  const model = useSignInEmailLinkModel(props.factor, 'second');
  const controller = useSignInEmailLinkController(model);

  return (
    <SignInEmailLinkView
      variant='second'
      status={controller.status}
      safeIdentifier={model.safeIdentifier}
      profileImageUrl={model.profileImageUrl}
      showClientTrustNotice={props.showClientTrustNotice}
      showNewDeviceNotice={model.showNewDeviceNotice}
      onResend={controller.restartVerification}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    />
  );
};
