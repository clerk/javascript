import { renderJSON } from '@clerk/shared/testUtils';
import { SessionActivity, SessionWithActivitiesResource, UserResource } from '@clerk/types';
import * as React from 'react';
import { ActiveDevicesCard } from 'ui/userProfile/security/DevicesAndActivity/ActiveDevicesCard';

const sessionWithActivities = {
  id: 'sess_id',
  lastActiveAt: new Date(),
  latestActivity: {
    browserName: 'Safari',
    browserVersion: '10',
    city: 'Athens',
    country: 'Greece',
    deviceType: 'Iphone',
    id: '123',
    ipAddress: '123.123.123.123',
    isMobile: false,
  } as any as SessionActivity,
} as SessionWithActivitiesResource;

jest.mock('ui/contexts', () => {
  return {
    withCoreUserGuard: (a: any) => a,
    useCoreSession: () => {
      return { id: 'sess1' };
    },
    useCoreUser: () => {
      return {
        getSessions: () => {
          return Promise.resolve([sessionWithActivities]);
        },
      } as UserResource;
    },
  };
});

describe('<ActiveDevicesCard/>', () => {
  it('renders the component', () => {
    const tree = renderJSON(<ActiveDevicesCard />);
    expect(tree).toMatchSnapshot();
  });
});
