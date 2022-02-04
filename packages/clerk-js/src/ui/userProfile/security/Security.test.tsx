import { mocked, renderJSON } from '@clerk/shared/testUtils';
import {
  EnvironmentResource,
  SessionActivity,
  SessionResource,
  SessionWithActivitiesResource,
  UserResource,
} from '@clerk/types';
import * as React from 'react';
import { PartialDeep } from 'type-fest';
import { useEnvironment } from 'ui/contexts';
import { Security } from 'ui/userProfile/security/Security';

const sessionWithActivities: Partial<SessionWithActivitiesResource> = {
  id: 'sess_id',
  lastActiveAt: new Date(),
  latestActivity: {
    id: 'session_activity_1/',
    country: 'greece',
    isMobile: false,
  } as any as SessionActivity,
};

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(),
    useCoreSession: () => {
      return { id: 'sess_id' } as SessionResource;
    },
    withCoreUserGuard: (a: any) => a,
    useCoreClerk: () => {
      return {
        navigate: jest.fn(),
      };
    },
    useCoreUser: () => {
      return {
        twoFactorEnabled: () => true,
        passwordEnabled: true,
        getSessions: () => {
          return Promise.resolve([sessionWithActivities]);
        },
      } as UserResource;
    },
  };
});

describe('<Security/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Security page with 2nd factor enabled', async () => {
    mocked(
      useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>,
      true
    ).mockImplementation(
      () =>
        ({
          authConfig: {
            secondFactors: ['phone_code'],
            password: 'on',
          },
          displayConfig: {
            branded: true,
          },
        } as PartialDeep<EnvironmentResource>)
    );
    const tree = renderJSON(<Security />);
    expect(tree).toMatchSnapshot();
  });
});
