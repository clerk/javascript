import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSignUpPhoneCodeCardController } from './sign-up-phone-code-card.controller';
import { useSignUpPhoneCodeCardModel } from './sign-up-phone-code-card.model';
import { SignUpPhoneCodeCardView } from './sign-up-phone-code-card.view';

const SignUpPhoneCodeCardContent = () => {
  const model = useSignUpPhoneCodeCardModel();
  const controller = useSignUpPhoneCodeCardController(model);

  return <SignUpPhoneCodeCardView {...controller} />;
};

export const SignUpPhoneCodeCard = withCardStateProvider(SignUpPhoneCodeCardContent);
