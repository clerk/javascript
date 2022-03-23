import { renderJSON } from '@clerk/shared/testUtils';
import { SessionResource, UserResource } from '@clerk/types';
import React from 'react';

import { UserButtonPopup } from './UserButtonPopup';

const defaultSessions = [
  {
    id: 'deadbeef',
    publicUserData: {
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: 'http://test.host/profile.png',
      primaryEmailAddress: 'jdoe@example.com',
    },
    status: 'active',
  },
  {
    id: 'cafebabe',
    publicUserData: {
      firstName: 'Carla',
      lastName: 'Coe',
      profileImageUrl: 'http://test.host/profile.png',
      primaryEmailAddress: 'ccoe@example.com',
    },
    status: 'active',
  },
] as any as SessionResource[];

let singleSessionMode = true;
let sessions: SessionResource[] = [];

jest.mock('ui/contexts', () => {
  return {
    useCoreSessionList: () => {
      return sessions;
    },
    useCoreClerk: () => {
      return {
        setSession: jest.fn(),
        signOut: jest.fn(),
        signOutOne: jest.fn(),
      };
    },
    withCoreUserGuard: (a: any) => a,
    useCoreSession: () => {
      return {
        id: 'deadbeef',
        user: {
          firstName: 'John',
          lastName: 'Doe',
          profileImageUrl: 'http://test.host/profile.png',
          primaryEmailAddress: 'jdoe@example.com',
        },
      };
    },
    useCoreUser: () => {
      return {
        firstName: 'John',
        lastName: 'Doe',
      } as UserResource;
    },
    useEnvironment: jest.fn(() => ({
      authConfig: {
        singleSessionMode,
      },
      displayConfig: {
        branded: false,
      },
    })),
    useUserButtonContext: jest.fn(() => ({
      navigateAfterMultiSessionSingleSignOut: jest.fn(),
      navigateAfterSignOut: jest.fn(),
      navigateAfterSwitchSession: jest.fn(),
      userProfileURL: 'http://test.host/profile',
      signInUrl: 'http://test.host/signin',
    })),
  };
});

describe('UserButtonPopup', () => {
  describe('multi session mode', () => {
    beforeEach(() => {
      singleSessionMode = false;
      sessions = defaultSessions;
    });

    it('renders the popup with all the available sessions', () => {
      const tree = renderJSON(<UserButtonPopup />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('single session mode', () => {
    beforeEach(() => {
      singleSessionMode = true;
      sessions = defaultSessions;
    });

    it('renders the popup with all the available sessions', () => {
      const tree = renderJSON(<UserButtonPopup />);
      expect(tree).toMatchSnapshot();
    });

    it('only renders active sessions', () => {
      sessions[sessions.length - 1].status = 'expired';
      const tree = renderJSON(<UserButtonPopup />);
      expect(tree).toMatchSnapshot();
    });
  });
});
