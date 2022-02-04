import React from 'react';
import { Header, withRedirectToHome } from 'ui/common';
import { ActiveAccountsManager } from 'ui/common/activeAccountsManager/ActiveAccountsManager';
import {
  useCoreSessionList,
  useEnvironment,
  useSignInContext,
} from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

function _SignInAccountSwitcher(): JSX.Element | null {
  const { displayConfig } = useEnvironment();
  const { navigate } = useNavigate();
  const { navigateAfterSignIn } = useSignInContext();
  const { userProfileUrl, signInUrl } = displayConfig;
  const sessions = useCoreSessionList().filter(s => s.status === 'active');

  return (
    <>
      <div className='cl-sing-in-account-switcher'>
        <Header />
        <p>Select an account to continue</p>
        <ActiveAccountsManager
          sessions={sessions}
          showActiveAccountButtons={false}
          navigateAfterSignOutAll={() => {
            navigate(displayConfig.afterSignOutAllUrl);
          }}
          navigateAfterSwitchSession={navigateAfterSignIn}
          userProfileUrl={userProfileUrl}
          signInUrl={signInUrl}
        />
      </div>
    </>
  );
}

export const SignInAccountSwitcher = withRedirectToHome(_SignInAccountSwitcher);
