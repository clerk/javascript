import type { SessionWithActivitiesResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import { within } from '@testing-library/dom';

import { render, screen, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { SecurityPage } from '../SecurityPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('SecurityPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    const { queryByText } = render(<SecurityPage />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
    expect(queryByText(/^password/i)).not.toBeInTheDocument();
  });

  it('renders the Password section if instance is password based', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPassword({
        required: true,
      });
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    const { getByText } = render(<SecurityPage />, { wrapper });
    await waitFor(() => getByText(/^password/i));
  });

  it('shows the active devices of the user and has appropriate buttons', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
      f.withUser({
        external_accounts: ['google'],
        first_name: 'George',
        last_name: 'Clerk',
      });
    });
    fixtures.clerk.user!.getSessions.mockReturnValue(
      Promise.resolve([
        {
          pathRoot: '/me/sessions',
          id: fixtures.clerk.session?.id,
          status: 'active',
          expireAt: '2022-12-01T01:55:44.636Z',
          abandonAt: '2022-12-24T01:55:44.636Z',
          lastActiveAt: '2022-11-24T12:11:49.328Z',
          latestActivity: {
            id: 'sess_activity_2HyQwElm529O5NDL1KNpJAGWVJZ',
            deviceType: 'Macintosh',
            browserName: 'Chrome',
            browserVersion: '107.0.0.0',
            country: 'Greece',
            city: 'Athens',
            isMobile: false,
          },
          actor: null,
        } as any as SessionWithActivitiesResource,
        {
          pathRoot: '/me/sessions',
          id: 'sess_2HyQfBh8wRJUbpvCtPNllWdsHFK',
          status: 'active',
          expireAt: '2022-12-01T01:55:44.636Z',
          abandonAt: '2022-12-24T01:55:44.636Z',
          lastActiveAt: '2022-11-24T12:11:49.328Z',
          latestActivity: {
            id: 'sess_activity_2HyQwElm529O5NDL1KNpJAGWVJZ',
            deviceType: 'Macintosh',
            browserName: 'Chrome',
            browserVersion: '107.0.0.0',
            country: 'Greece',
            city: 'Athens',
            isMobile: false,
          },
          actor: null,
        } as any as SessionWithActivitiesResource,
      ]),
    );

    render(<SecurityPage />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
    screen.getByText(/Active Devices/i);

    const element = (await screen.findByText(/This device/i)).parentElement?.parentElement?.parentElement
      ?.parentElement;
    expect(element?.children[1]).not.toBeDefined();

    const devices = screen.getAllByText(/Macintosh/i);
    devices.forEach(d => {
      const elem = d.parentElement?.parentElement?.parentElement?.parentElement;
      expect(elem).toBeDefined();
      const { getByText } = within(elem!);
      getByText(/107.0.0.0/i);
      getByText(/Athens/i);
      getByText(/Greece/i);
      if (elem !== element) {
        expect(elem?.children[1]).toBeDefined();
      }
    });
  });
});
