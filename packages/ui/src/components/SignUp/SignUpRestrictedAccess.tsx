import { useSignUpRestrictedAccessController } from './sign-up-restricted-access.controller';
import { useSignUpRestrictedAccessModel } from './sign-up-restricted-access.model';
import { SignUpRestrictedAccessView } from './sign-up-restricted-access.view';

export const SignUpRestrictedAccess = () => {
  const model = useSignUpRestrictedAccessModel();
  const controller = useSignUpRestrictedAccessController(model);

  return <SignUpRestrictedAccessView {...controller} />;
};
