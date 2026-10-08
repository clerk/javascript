import { useSignUpEmailLinkCardController } from './sign-up-email-link-card.controller';
import { useSignUpEmailLinkCardModel } from './sign-up-email-link-card.model';
import { SignUpEmailLinkCardView } from './sign-up-email-link-card.view';

export const SignUpEmailLinkCard = () => {
  const model = useSignUpEmailLinkCardModel();
  const controller = useSignUpEmailLinkCardController(model);

  return <SignUpEmailLinkCardView {...controller} />;
};
