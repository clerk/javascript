import type { UserProfileProps } from '@clerk/types';
import React from 'react';
import { PoweredByClerk } from 'ui/common';
import { withCoreUserGuard } from 'ui/contexts';

import { AccountRoutes } from './account';
import { DefaultNavBarLinks } from './NavBarLinks';
import { SecurityRoutes } from './security';
import { VerifyMagicLinkRoutes } from './VerifyMagicLink';

const UserProfile = withCoreUserGuard<UserProfileProps>(({ hideNavigation, only }) => {
  let components;

  if (only) {
    hideNavigation = true;
  }

  switch (only) {
    case 'account':
      components = <AccountRoutes standAlone />;
      break;
    case 'security':
      components = <SecurityRoutes standAlone />;
      break;
    default:
      components = (
        <>
          <AccountRoutes index />
          <SecurityRoutes />
          <PoweredByClerk className='cl-powered-by-clerk' />
        </>
      );
      break;
  }

  return (
    <>
      {!hideNavigation && (
        <nav className='cl-navbar'>
          <DefaultNavBarLinks />
        </nav>
      )}
      <div className='cl-main'>
        {components}
        <VerifyMagicLinkRoutes />
      </div>
    </>
  );
});

export { UserProfile };
