import { useSignUpRedirectController } from './sign-up-redirect.controller';
import { useSignUpRedirectModel } from './sign-up-redirect.model';
import { SignUpRedirectView } from './sign-up-redirect.view';

export const SignUpRedirect = () => {
  const model = useSignUpRedirectModel();
  useSignUpRedirectController(model);

  return <SignUpRedirectView />;
};
