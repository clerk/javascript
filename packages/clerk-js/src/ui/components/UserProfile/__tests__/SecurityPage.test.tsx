import type { SessionWithActivitiesResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import { within } from '@testing-library/dom';

import { render, screen, waitFor } from '../../../../testUtils';
import { clearFetchCache } from '../../../hooks';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { SecurityPage } from '../SecurityPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('SecurityPage', () => {
  /**
   * `<SecurityPage/>` internally uses useFetch which caches the results, be sure to clear the cache before each test
   */
  beforeEach(() => {
    clearFetchCache();
  });

  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    const { queryByText } = render(<SecurityPage />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
    expect(queryByText(/^password/i)).not.toBeInTheDocument();
    expect(queryByText(/^Two-step verification/i)).not.toBeInTheDocument();
    expect(queryByText(/^passkeys/i)).not.toBeInTheDocument();
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

  it('renders the MFA section if instance supports it', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withPhoneNumber({
        used_for_second_factor: true,
        second_factors: ['phone_code'],
      });
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    const { getByText } = render(<SecurityPage />, { wrapper });
    await waitFor(() => getByText('Two-step verification'));
  });

  it('renders the Passkeys section if instance supports it', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        passkeys: [
          {
            object: 'passkey',
            id: '1234',
            name: 'Chrome on Mac',
            created_at: Date.now(),
            last_used_at: Date.now(),
            verification: null,
            updated_at: Date.now(),
            credential_id: 'some_id',
          },
        ],
      });
      f.withPasskey();
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    const { getByText } = render(<SecurityPage />, { wrapper });
    await waitFor(() => getByText('Passkeys'));
    getByText('Chrome on Mac');
    getByText(/^Created:/);
    getByText(/^Last used:/);
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
          revoke: jest.fn().mockResolvedValue({}),
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
          revoke: jest.fn().mockResolvedValue({}),
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
