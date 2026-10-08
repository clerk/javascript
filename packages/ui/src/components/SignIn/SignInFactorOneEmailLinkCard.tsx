import type { EmailLinkFactor } from '@clerk/shared/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import { useSignInEmailLinkController } from './sign-in-email-link.controller';
import { useSignInEmailLinkModel } from './sign-in-email-link.model';
import { SignInEmailLinkView } from './sign-in-email-link.view';

type SignInFactorOneEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailLinkFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export const SignInFactorOneEmailLinkCard = (props: SignInFactorOneEmailLinkCardProps) => {
  const model = useSignInEmailLinkModel(props.factor, 'first');
  const controller = useSignInEmailLinkController(model);

  return (
    <SignInEmailLinkView
      variant='first'
      status={controller.status}
      safeIdentifier={model.safeIdentifier}
      profileImageUrl={model.profileImageUrl}
      showNewDeviceNotice={model.showNewDeviceNotice}
      onResend={controller.restartVerification}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    />
  );
};
