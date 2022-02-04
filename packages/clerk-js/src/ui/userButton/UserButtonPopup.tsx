import { Avatar } from '@clerk/shared/components/avatar';
import React from 'react';
import { ActiveAccountsManager } from 'ui/common/activeAccountsManager/ActiveAccountsManager';
import {
  useCoreSession,
  useCoreSessionList,
  useCoreUser,
  useUserButtonContext,
  withCoreUserGuard,
} from 'ui/contexts';

import { Salutation } from './Salutation';

function UserButtonPopupBase(): JSX.Element | null {
  const sessions = useCoreSessionList();
  const session = useCoreSession();
  const user = useCoreUser();
  const userButtonContext = useUserButtonContext();

  const otherSessions = sessions
    .filter(({ id }) => id !== session.id)
    .filter(s => s.status === 'active');

  return (
    <>
      <div className='cl-user-button-popup-current-account'>
        <Avatar
          className='cl-user-button-avatar'
          firstName={user.firstName || ''}
          lastName={user.lastName || ''}
          profileImageUrl={user.profileImageUrl}
          size={64}
          optimize
        />
        <Salutation user={user} />
        <div className='cl-user-button-identifier'>
          {user.primaryEmailAddress?.toString()}
        </div>
      </div>
      <ActiveAccountsManager sessions={otherSessions} {...userButtonContext} />
    </>
  );
}
UserButtonPopupBase.displayName = 'UserButtonPopup';

export const UserButtonPopup = withCoreUserGuard(UserButtonPopupBase);
