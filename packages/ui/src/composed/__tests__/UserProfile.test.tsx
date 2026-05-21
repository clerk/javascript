import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { clearFetchCache } from '../../hooks';
import { AccountPage } from '../../components/UserProfile/AccountPage';
import { SecurityPage } from '../../components/UserProfile/SecurityPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('Experimental UserProfile', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  describe('Account page', () => {
    it('renders profile section', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      render(<AccountPage />, { wrapper });
      screen.getByText('Test User');
    });

    it('renders email section when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(<AccountPage />, { wrapper });
      expect(screen.getAllByText(/email address/i).length).toBeGreaterThan(0);
    });

    it('renders phone section when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUser({ email_addresses: ['test@clerk.com'], phone_numbers: ['+11111111111'] });
      });

      render(<AccountPage />, { wrapper });
      expect(screen.getAllByText(/phone number/i).length).toBeGreaterThan(0);
    });

    it('renders username section when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withUser({ email_addresses: ['test@clerk.com'], username: 'testuser' });
      });

      render(<AccountPage />, { wrapper });
      screen.getByText('testuser');
    });

    it('renders connected accounts section when social providers are enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          email_addresses: ['test@clerk.com'],
          external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
        });
      });

      render(<AccountPage />, { wrapper });
      screen.getByText(/connected accounts/i);
    });

    it('hides sections that are disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ first_name: 'Test', last_name: 'User' });
      });

      const { queryByText } = render(<AccountPage />, { wrapper });
      expect(queryByText(/connected accounts/i)).not.toBeInTheDocument();
    });

    it('inline form flow: update profile opens form', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      const { getByRole, getByLabelText, userEvent } = render(<AccountPage />, { wrapper });

      await userEvent.click(getByRole('button', { name: /update profile/i }));
      await waitFor(() => getByLabelText(/first name/i));
      expect(getByLabelText(/first name/i)).toBeInTheDocument();
    });

    it('hides add buttons when enterprise SSO disables additional identifications', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          enterprise_accounts: [
            {
              active: true,
              enterprise_connection: {
                disable_additional_identifications: true,
              },
            } as any,
          ],
        });
        f.withEnterpriseSso();
      });

      const { queryByRole } = render(<AccountPage />, { wrapper });
      expect(queryByRole('button', { name: /add email address/i })).not.toBeInTheDocument();
    });
  });

  describe('Security page', () => {
    it('renders password section when instance is password-based', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withPassword();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<SecurityPage />, { wrapper });
      await waitFor(() => screen.getByText(/^password/i));
    });

    it('renders passkey section when passkeys are enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withPasskey();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<SecurityPage />, { wrapper });
      await waitFor(() => screen.getByText(/^passkeys/i));
    });

    it('renders active devices section', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<SecurityPage />, { wrapper });
      await waitFor(() => screen.getByText(/active devices/i));
    });

    it('renders delete account section when enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: true });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<SecurityPage />, { wrapper });
      await waitFor(() => expect(screen.getAllByText(/delete account/i).length).toBeGreaterThan(0));
    });

    it('hides delete account section when disabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: false });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<SecurityPage />, { wrapper });
      await waitFor(() => screen.getByText(/active devices/i));
      expect(screen.queryByText(/danger section/i)).not.toBeInTheDocument();
    });
  });
});
