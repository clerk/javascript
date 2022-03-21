import { mocked, renderJSON } from '@clerk/shared/testUtils';
import { EnvironmentResource, SessionResource } from '@clerk/types';
import React from 'react';
import { useEnvironment } from 'ui/contexts';

import { ActiveAccountsManager } from './ActiveAccountsManager';

const session = {
  id: 'deadbeef',
  publicUserData: {
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'http://test.host/profile.png',
    primaryEmailAddress: 'jdoe@example.com',
  },
} as any as SessionResource;

const sessions = [
  session,
  {
    id: 'cafebabe',
    publicUserData: {
      firstName: 'Carla',
      lastName: 'Coe',
      profileImageUrl: 'http://test.host/profile.png',
      primaryEmailAddress: 'ccoe@example.com',
    },
  },
] as any as SessionResource[];

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: jest.fn(() => {
    return {
      navigate: mockNavigate,
    };
  }),
}));

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(),
    useCoreClerk: () => {
      return {
        setSession: jest.fn(),
      };
    },
    useCoreSessionList: () => {
      return sessions;
    },
    useCoreSession: () => {
      return session;
    },
  };
});

const noop = () => {
  //
};

const singleSessionResource = {
  authConfig: {
    singleSessionMode: true,
  },
  displayConfig: {
    branded: false,
  },
} as any as EnvironmentResource;

const multiSessionResource = {
  authConfig: {
    singleSessionMode: false,
  },
  displayConfig: {
    branded: false,
  },
} as any as EnvironmentResource;

describe('ActiveAccountsManager', () => {
  it('renders a switcher with all the available sessions', () => {
    mocked(useEnvironment as jest.Mock<EnvironmentResource>, true).mockImplementation(() => multiSessionResource);

    const tree = renderJSON(
      <ActiveAccountsManager
        sessions={sessions}
        navigateAfterSignOutAll={noop}
        navigateAfterSwitchSession={noop}
        userProfileUrl={'user_profile_url'}
        signInUrl={'sign_in_url'}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('does not render active accounts with only a single session', () => {
    mocked(useEnvironment as jest.Mock<EnvironmentResource>, true).mockImplementation(() => multiSessionResource);

    const tree = renderJSON(
      <ActiveAccountsManager
        showActiveAccountButtons={false}
        sessions={[session]}
        navigateAfterSignOutAll={noop}
        navigateAfterSwitchSession={noop}
        userProfileUrl={'user_profile_url'}
        signInUrl={'sign_in_url'}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders all active sessions even in single session resource mode', () => {
    mocked(useEnvironment as jest.Mock<EnvironmentResource>, true).mockImplementation(() => singleSessionResource);

    const tree = renderJSON(
      <ActiveAccountsManager
        showActiveAccountButtons={false}
        sessions={[session]}
        navigateAfterSignOutAll={noop}
        navigateAfterSwitchSession={noop}
        userProfileUrl={'user_profile_url'}
        signInUrl={'sign_in_url'}
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
