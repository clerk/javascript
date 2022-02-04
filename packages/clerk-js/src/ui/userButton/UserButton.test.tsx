import { renderJSON } from '@clerk/shared/testUtils';
import { UserResource } from '@clerk/types';
import React from 'react';
import ReactDOM from 'react-dom';

import { UserButton } from './UserButton';

jest.mock('ui/contexts', () => {
  return {
    useCoreSessionList: () => {
      return [
        {
          id: 'deadbeef',
          user: {
            firstName: 'John',
            lastName: 'Doe',
            profileImageUrl: 'http://test.host/profile.png',
            primaryEmailAddress: 'jdoe@example.com',
          },
        },
      ];
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
      authConfig: {},
      displayConfig: { branded: false },
    })),
    useUserButtonContext: () => {
      return {
        useUserButtonContext: jest.fn(() => ({
          navigateAfterSignOutOne: jest.fn(),
          navigateAfterSignOutAll: jest.fn(),
          navigateAfterSwitchSession: jest.fn(),
          userProfileURL: 'http://test.host/profile',
          signInUrl: 'http://test.host/signin',
        })),
      };
    },
  };
});

describe('UserButton', () => {
  beforeAll(() => {
    //@ts-ignore
    ReactDOM.createPortal = (node) => node;
  });

  it('renders the user button', () => {
    const tree = renderJSON(<UserButton />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the user button with name', () => {
    const tree = renderJSON(<UserButton showName />);
    expect(tree).toMatchSnapshot();
  });
});
