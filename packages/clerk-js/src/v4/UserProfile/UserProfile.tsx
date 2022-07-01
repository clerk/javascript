import React from 'react';

import { withCoreUserGuard } from '../../ui/contexts';
import { Flow } from '../customizables';
import { UserProfileCard, withCardStateProvider } from '../elements';
import { Content } from './Content';
import { NavBar } from './Navbar';

const _UserProfile = () => {
  return (
    <Flow.Root flow='userProfile'>
      <Flow.Part>
        <UserProfileCard gap={8}>
          <NavBar />
          <Content />
        </UserProfileCard>
      </Flow.Part>
    </Flow.Root>
  );
};

export const UserProfile = withCoreUserGuard(withCardStateProvider(_UserProfile));
