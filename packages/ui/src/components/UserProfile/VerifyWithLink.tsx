import type { EmailVerificationProps } from './email-form.types';
import { useEmailVerificationController } from './email-verification.controller';
import { VerificationSuccessPageView, VerifyWithLinkView } from './verify-with-link.view';

export const VerifyWithLink = (props: EmailVerificationProps) => {
  const controller = useEmailVerificationController(props);
  return <VerifyWithLinkView controller={controller} />;
};

export const VerificationSuccessPage = () => <VerificationSuccessPageView />;
