import { ActiveSessionResource, SessionResource } from '@clerk/types';
import React from 'react';
import { PoweredByClerk } from 'ui/common';
import { useCoreClerk, useCoreSession, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { useUserButtonPopupVisibility } from 'ui/userButton/contexts/PopupVisibilityContext';
import { windowNavigate } from 'utils';

import AccountSwitcher from './AccountSwitcher';
import { ActiveAccountButtonSet } from './ActiveAccountButtonSet';
import SignOutAll from './SignOutAll';

interface ActiveAccountsManagerProps {
  sessions: SessionResource[];
  navigateAfterSignOutAll: () => void;
  navigateAfterSwitchSession: () => void;
  navigateAfterSignOutOne?: () => void;
  userProfileUrl: string;
  signInUrl: string;
  showActiveAccountButtons?: boolean;
}

export function ActiveAccountsManager({
  sessions,
  navigateAfterSignOutAll,
  navigateAfterSignOutOne,
  navigateAfterSwitchSession,
  signInUrl,
  userProfileUrl,
  showActiveAccountButtons = true,
}: ActiveAccountsManagerProps): JSX.Element {
  const { setSession, signOut } = useCoreClerk();
  const { id: currentSessionId } = useCoreSession();
  const { authConfig } = useEnvironment();
  const { navigate } = useNavigate();
  const [signoutInProgress, setSignoutInProgress] = React.useState(false);
  const [managementNavigationInProgress, setManagementNavigationInProgress] = React.useState(false);
  const { setPopupVisible } = useUserButtonPopupVisibility();

  const handleSignOutSingle = () => {
    setSignoutInProgress(true);
    if (authConfig.singleSessionMode || sessions.length === 0) {
      handleSignOutAll().catch(() => {
        setSignoutInProgress(false);
      });
      return;
    }

    signOut(navigateAfterSignOutOne, { sessionId: currentSessionId }).catch(() => setSignoutInProgress(false));
  };

  const handleManageAccountClick = () => {
    setManagementNavigationInProgress(true);
    navigate(userProfileUrl).finally(() => {
      setManagementNavigationInProgress(false);
      setPopupVisible(false);
    });
  };

  const handleAddAccountClick = () => {
    windowNavigate(signInUrl);
  };

  const handleAccountClick = (session: SessionResource) => {
    // TODO We only set session for active sessions here.
    // In the future, if the passed session is an expired session, we will allow the
    // user to revive it.
    if (session.status === 'active') {
      setSession(session as ActiveSessionResource, navigateAfterSwitchSession);
    }
  };

  const handleSignOutAll = () => {
    return signOut(navigateAfterSignOutAll);
  };

  const shouldRenderAccountSwitcher = sessions.length || !authConfig.singleSessionMode;
  return (
    <div className='cl-active-accounts-manager'>
      {showActiveAccountButtons && (
        <ActiveAccountButtonSet
          handleManageAccount={handleManageAccountClick}
          handleSignout={handleSignOutSingle}
          isSignoutLoading={signoutInProgress}
          isManagementNavigationLoading={managementNavigationInProgress}
        />
      )}
      {shouldRenderAccountSwitcher && (
        <AccountSwitcher
          sessions={sessions}
          isSingleSession={authConfig.singleSessionMode}
          handleAccountClick={handleAccountClick}
          handleAddAccountClick={handleAddAccountClick}
        />
      )}
      {Boolean(sessions.length) && <SignOutAll handleSignOutAll={handleSignOutAll} />}
      <PoweredByClerk className='cl-powered-by-clerk' />
    </div>
  );
}
