import { useEnvironment, useSignInContext, useSignOutContext } from '../../contexts';
import { useMultisessionModel } from '../UserButton/multisession.model';

export const useSignInAccountSwitcherModel = () => {
  const { userProfileUrl } = useEnvironment().displayConfig;
  const { afterSignInUrl, path: signInPath, signInUrl, taskUrl } = useSignInContext();
  const { navigateAfterSignOut } = useSignOutContext();
  const options = {
    taskUrl,
    navigateAfterSignOut,
    afterSwitchSessionUrl: afterSignInUrl,
    userProfileUrl,
    signInUrl: signInPath ?? signInUrl,
    userId: undefined,
  };

  return { multisession: useMultisessionModel(options) };
};
