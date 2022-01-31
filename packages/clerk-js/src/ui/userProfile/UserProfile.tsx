import React from 'react';
import { withCoreUserGuard } from 'ui/contexts';
import { DefaultNavBarLinks } from './NavBarLinks';
import { AccountRoutes } from './account';
import { SecurityRoutes } from './security';
import { VerifyMagicLinkRoutes } from './VerifyMagicLink';
import type { UserProfileProps } from '@clerk/types';
import { PoweredByClerk } from 'ui/common';

const UserProfile = withCoreUserGuard<UserProfileProps>(
  ({ hideNavigation, only }) => {
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
  },
);

export { UserProfile };
