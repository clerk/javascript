import { useRedirectToSignInController } from './sign-in-routes.controller';
import { useRedirectToSignInModel } from './sign-in-routes.model';

export function RedirectToSignIn() {
  const model = useRedirectToSignInModel();
  useRedirectToSignInController(model);
  return null;
}
