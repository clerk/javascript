import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { clearFetchCache } from '@/ui/hooks';

import { OAuthApplicationsPage } from '../OAuthApplicationsPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('OAuthApplicationsPage', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  it('lists applications that have access to the user', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    vi.spyOn(fixtures.clerk.oauthApplication, 'getApplications').mockResolvedValue([
      {
        object: 'oauth_application',
        id: 'oa_123',
        name: 'Example App',
        clientUri: 'https://app.example.com/settings',
        clientImageUrl: 'https://img.example.com/logo.png',
      },
      {
        object: 'oauth_application',
        id: 'oa_456',
        name: 'No Logo App',
        clientUri: null,
        clientImageUrl: null,
      },
    ]);

    render(<OAuthApplicationsPage />, { wrapper });

    expect(await screen.findByText('Example App')).toBeVisible();
    expect(screen.getByText('app.example.com')).toBeVisible();
    expect(screen.getByText('No Logo App')).toBeVisible();
  });

  it('renders an empty state', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    vi.spyOn(fixtures.clerk.oauthApplication, 'getApplications').mockResolvedValue([]);

    render(<OAuthApplicationsPage />, { wrapper });

    expect(await screen.findByText('No OAuth applications currently have access to your account.')).toBeVisible();
  });

  it('renders fetch errors', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    vi.spyOn(fixtures.clerk.oauthApplication, 'getApplications').mockRejectedValue(
      new Error('Unable to load OAuth applications'),
    );

    render(<OAuthApplicationsPage />, { wrapper });

    expect(await screen.findByText('Unable to load OAuth applications')).toBeInTheDocument();
    expect(screen.queryByText('No OAuth applications currently have access to your account.')).toBeNull();
  });

  it('isolates cached applications by user', async () => {
    const first = await createFixtures(f => {
      f.withUser({ id: 'user_a', email_addresses: ['a@clerk.com'] });
    });
    const firstSpy = vi.spyOn(first.fixtures.clerk.oauthApplication, 'getApplications').mockResolvedValue([
      {
        object: 'oauth_application',
        id: 'oa_a',
        name: 'User A App',
        clientUri: null,
        clientImageUrl: null,
      },
    ]);

    const firstRender = render(<OAuthApplicationsPage />, { wrapper: first.wrapper });
    expect(await screen.findByText('User A App')).toBeVisible();
    firstRender.unmount();
    firstSpy.mockRestore();

    const second = await createFixtures(f => {
      f.withUser({ id: 'user_b', email_addresses: ['b@clerk.com'] });
    });
    const secondSpy = vi.spyOn(second.fixtures.clerk.oauthApplication, 'getApplications').mockResolvedValue([
      {
        object: 'oauth_application',
        id: 'oa_b',
        name: 'User B App',
        clientUri: null,
        clientImageUrl: null,
      },
    ]);

    render(<OAuthApplicationsPage />, { wrapper: second.wrapper });

    expect(await screen.findByText('User B App')).toBeVisible();
    expect(screen.queryByText('User A App')).toBeNull();
    expect(secondSpy).toHaveBeenCalledOnce();
  });
});
