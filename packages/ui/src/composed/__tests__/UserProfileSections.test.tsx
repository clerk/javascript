import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { clearFetchCache } from '../../hooks';
import { UserProfileAccountPanel } from '../UserProfile/Account';
import { UserProfileConnectedAccountsSection } from '../UserProfile/AccountConnectedAccounts';
import { UserProfileEmailSection } from '../UserProfile/AccountEmails';
import { UserProfileEnterpriseAccountsSection } from '../UserProfile/AccountEnterpriseAccounts';
import { UserProfilePhoneSection } from '../UserProfile/AccountPhone';
import { UserProfileProfileSection } from '../UserProfile/AccountProfile';
import { UserProfileUsernameSection } from '../UserProfile/AccountUsername';
import { UserProfileWeb3Section } from '../UserProfile/AccountWeb3';
import { UserProfileSecurityPanel } from '../UserProfile/Security';
import { UserProfileActiveDevicesSection } from '../UserProfile/SecurityActiveDevices';
import { UserProfileDeleteSection } from '../UserProfile/SecurityDelete';
import { UserProfilePasswordSection } from '../UserProfile/SecurityPassword';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('UserProfile composed sections', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  describe('Account — passthrough mode', () => {
    it('renders all enabled sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPhoneNumber();
        f.withUsername();
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          first_name: 'Test',
          last_name: 'User',
          email_addresses: ['test@clerk.com'],
          phone_numbers: ['+11111111111'],
          username: 'testuser',
          external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
        });
      });

      render(<UserProfileAccountPanel />, { wrapper });
      screen.getByText('Test User');
      screen.getByText('testuser');
      expect(screen.getAllByText(/email address/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/phone number/i).length).toBeGreaterThan(0);
      screen.getByText(/connected accounts/i);
    });

    it('hides disabled sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      const { queryByText } = render(<UserProfileAccountPanel />, { wrapper });
      expect(queryByText(/phone number/i)).not.toBeInTheDocument();
      expect(queryByText(/connected accounts/i)).not.toBeInTheDocument();
    });

    it('inline form flow: update profile opens form', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      const { getByRole, getByLabelText, userEvent } = render(<UserProfileAccountPanel />, { wrapper });
      await userEvent.click(getByRole('button', { name: /update profile/i }));
      await waitFor(() => getByLabelText(/first name/i));
      expect(getByLabelText(/first name/i)).toBeInTheDocument();
    });
  });

  describe('Account — section composition mode', () => {
    it('renders only declared sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPhoneNumber();
        f.withUser({
          first_name: 'Test',
          last_name: 'User',
          email_addresses: ['test@clerk.com'],
          phone_numbers: ['+11111111111'],
        });
      });

      const { queryByText } = render(
        <UserProfileAccountPanel>
          <UserProfileProfileSection />
          <UserProfileEmailSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText('Test User');
      expect(screen.getAllByText(/email address/i).length).toBeGreaterThan(0);
      expect(queryByText(/phone number/i)).not.toBeInTheDocument();
    });

    it('renders header', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfileProfileSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText('Profile details');
    });

    it('renders custom content between sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfileProfileSection />
          <div data-testid='custom-banner'>Custom content</div>
          <UserProfileEmailSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      expect(screen.getByTestId('custom-banner')).toBeInTheDocument();
      screen.getByText('Custom content');
    });

    it('environment guard: disabled email renders null', async () => {
      const { wrapper } = await createFixtures(f => {
        // Email NOT enabled
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      const { queryByText } = render(
        <UserProfileAccountPanel>
          <UserProfileProfileSection />
          <UserProfileEmailSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText('Test User');
      expect(queryByText(/email address/i)).not.toBeInTheDocument();
    });
  });

  describe('Account — individual sections', () => {
    it('UserProfileProfileSection renders user name', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Jane', last_name: 'Doe' });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfileProfileSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText('Jane Doe');
    });

    it('UserProfileUsernameSection renders when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withUser({ email_addresses: ['test@clerk.com'], username: 'jdoe' });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfileUsernameSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText('jdoe');
    });

    it('UserProfileUsernameSection renders null when disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], username: 'jdoe' });
      });

      const { container } = render(
        <UserProfileAccountPanel>
          <UserProfileUsernameSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      expect(container.querySelector('[class*="profileSection"]')).not.toBeInTheDocument();
    });

    it('UserProfileEmailSection renders email list', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({ email_addresses: ['primary@clerk.com', 'secondary@clerk.com'] });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfileEmailSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText('primary@clerk.com');
      screen.getByText('secondary@clerk.com');
    });

    it('UserProfilePhoneSection renders phone list when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUser({ email_addresses: ['test@clerk.com'], phone_numbers: ['+11111111111'] });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfilePhoneSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      expect(screen.getAllByText(/phone number/i).length).toBeGreaterThan(0);
    });

    it('UserProfileConnectedAccountsSection renders when social providers enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          email_addresses: ['test@clerk.com'],
          external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
        });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfileConnectedAccountsSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText(/connected accounts/i);
    });

    it('UserProfileEnterpriseAccountsSection renders null when enterprise SSO disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { queryByText } = render(
        <UserProfileAccountPanel>
          <UserProfileEnterpriseAccountsSection />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      expect(queryByText(/enterprise accounts/i)).not.toBeInTheDocument();
    });

    it('UserProfileWeb3Section renders when web3_wallet enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withWeb3Wallet();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(
        <UserProfileAccountPanel>
          <UserProfileWeb3Section />
        </UserProfileAccountPanel>,
        { wrapper },
      );

      screen.getByText(/web3 wallets/i);
    });
  });

  describe('Account — section outside page', () => {
    it('useRequirePage throws when rendered outside a page component', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      expect(() => render(<UserProfileEmailSection />, { wrapper })).toThrow(
        '<UserProfileEmailSection> must be rendered inside a page component',
      );
    });
  });

  describe('Security — passthrough mode', () => {
    it('renders all enabled sections', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withPassword();
        f.withPasskey();
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: true });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<UserProfileSecurityPanel />, { wrapper });
      await waitFor(() => screen.getByText(/^password/i));
      screen.getByText(/^passkeys/i);
      screen.getByText(/active devices/i);
      expect(screen.getAllByText(/delete account/i).length).toBeGreaterThan(0);
    });

    it('hides disabled sections', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<UserProfileSecurityPanel />, { wrapper });
      await waitFor(() => screen.getByText(/active devices/i));
      expect(screen.queryByText(/^password/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^passkeys/i)).not.toBeInTheDocument();
    });
  });

  describe('Security — section composition mode', () => {
    it('renders only declared sections', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withPassword();
        f.withPasskey();
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: true });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      const { queryByText } = render(
        <UserProfileSecurityPanel>
          <UserProfilePasswordSection />
          <UserProfileActiveDevicesSection />
        </UserProfileSecurityPanel>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/^password/i));
      screen.getByText(/active devices/i);
      expect(queryByText(/^passkeys/i)).not.toBeInTheDocument();
      expect(queryByText(/delete account/i)).not.toBeInTheDocument();
    });

    it('UserProfileActiveDevicesSection renders without guard', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(
        <UserProfileSecurityPanel>
          <UserProfileActiveDevicesSection />
        </UserProfileSecurityPanel>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/active devices/i));
    });

    it('UserProfileDeleteSection respects user flag', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: false });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      const { queryByText } = render(
        <UserProfileSecurityPanel>
          <UserProfileDeleteSection />
          <UserProfileActiveDevicesSection />
        </UserProfileSecurityPanel>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/active devices/i));
      expect(queryByText(/delete account/i)).not.toBeInTheDocument();
    });
  });
});
