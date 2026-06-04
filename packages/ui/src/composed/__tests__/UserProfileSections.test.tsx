import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { clearFetchCache } from '../../hooks';
import { Account } from '../UserProfile/Account';
import { Security } from '../UserProfile/Security';
import { AccountConnectedAccounts } from '../UserProfile/AccountConnectedAccounts';
import { AccountEmails } from '../UserProfile/AccountEmails';
import { AccountEnterpriseAccounts } from '../UserProfile/AccountEnterpriseAccounts';
import { AccountPhone } from '../UserProfile/AccountPhone';
import { AccountProfile } from '../UserProfile/AccountProfile';
import { AccountUsername } from '../UserProfile/AccountUsername';
import { AccountWeb3 } from '../UserProfile/AccountWeb3';
import { SecurityActiveDevices } from '../UserProfile/SecurityActiveDevices';
import { SecurityDelete } from '../UserProfile/SecurityDelete';
import { SecurityMfa } from '../UserProfile/SecurityMfa';
import { SecurityPasskeys } from '../UserProfile/SecurityPasskeys';
import { SecurityPassword } from '../UserProfile/SecurityPassword';

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

      render(<Account />, { wrapper });
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

      const { queryByText } = render(<Account />, { wrapper });
      expect(queryByText(/phone number/i)).not.toBeInTheDocument();
      expect(queryByText(/connected accounts/i)).not.toBeInTheDocument();
    });

    it('inline form flow: update profile opens form', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
      });

      const { getByRole, getByLabelText, userEvent } = render(<Account />, { wrapper });
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
        <Account>
          <AccountProfile />
          <AccountEmails />
        </Account>,
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
        <Account>
          <AccountProfile />
        </Account>,
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
        <Account>
          <AccountProfile />
          <div data-testid='custom-banner'>Custom content</div>
          <AccountEmails />
        </Account>,
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
        <Account>
          <AccountProfile />
          <AccountEmails />
        </Account>,
        { wrapper },
      );

      screen.getByText('Test User');
      expect(queryByText(/email address/i)).not.toBeInTheDocument();
    });
  });

  describe('Account — individual sections', () => {
    it('AccountProfile renders user name', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Jane', last_name: 'Doe' });
      });

      render(
        <Account>
          <AccountProfile />
        </Account>,
        { wrapper },
      );

      screen.getByText('Jane Doe');
    });

    it('AccountUsername renders when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withUser({ email_addresses: ['test@clerk.com'], username: 'jdoe' });
      });

      render(
        <Account>
          <AccountUsername />
        </Account>,
        { wrapper },
      );

      screen.getByText('jdoe');
    });

    it('AccountUsername renders null when disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], username: 'jdoe' });
      });

      const { container } = render(
        <Account>
          <AccountUsername />
        </Account>,
        { wrapper },
      );

      expect(container.querySelector('[class*="profileSection"]')).not.toBeInTheDocument();
    });

    it('AccountEmails renders email list', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({ email_addresses: ['primary@clerk.com', 'secondary@clerk.com'] });
      });

      render(
        <Account>
          <AccountEmails />
        </Account>,
        { wrapper },
      );

      screen.getByText('primary@clerk.com');
      screen.getByText('secondary@clerk.com');
    });

    it('AccountPhone renders phone list when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUser({ email_addresses: ['test@clerk.com'], phone_numbers: ['+11111111111'] });
      });

      render(
        <Account>
          <AccountPhone />
        </Account>,
        { wrapper },
      );

      expect(screen.getAllByText(/phone number/i).length).toBeGreaterThan(0);
    });

    it('AccountConnectedAccounts renders when social providers enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          email_addresses: ['test@clerk.com'],
          external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
        });
      });

      render(
        <Account>
          <AccountConnectedAccounts />
        </Account>,
        { wrapper },
      );

      screen.getByText(/connected accounts/i);
    });

    it('AccountEnterpriseAccounts renders null when enterprise SSO disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { queryByText } = render(
        <Account>
          <AccountEnterpriseAccounts />
        </Account>,
        { wrapper },
      );

      expect(queryByText(/enterprise accounts/i)).not.toBeInTheDocument();
    });

    it('AccountWeb3 renders when web3_wallet enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withWeb3Wallet();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(
        <Account>
          <AccountWeb3 />
        </Account>,
        { wrapper },
      );

      screen.getByText(/web3 wallets/i);
    });

    it.skip('AccountWeb3 connect wallet calls createWeb3Wallet with a valid identifier — requires real moduleManager for @metamask imports', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withWeb3Wallet();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { userEvent } = render(
        <Account>
          <AccountWeb3 />
        </Account>,
        { wrapper },
      );

      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      await userEvent.click(connectButton);

      const metamaskItem = await screen.findByRole('menuitem', { name: /metamask/i });
      await userEvent.click(metamaskItem);

      await waitFor(() => {
        expect(fixtures.clerk.user?.createWeb3Wallet).toHaveBeenCalled();
      });
      const callArgs = (fixtures.clerk.user?.createWeb3Wallet as any).mock.calls[0];
      expect(callArgs[0].web3Wallet).not.toBe('');
    });
  });

  describe('Account — section outside page', () => {
    it('useRequirePage throws when rendered outside a page component', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      expect(() => render(<AccountEmails />, { wrapper })).toThrow(
        '<AccountEmails> must be rendered inside a page component',
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

      render(<Security />, { wrapper });
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

      render(<Security />, { wrapper });
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
        <Security>
          <SecurityPassword />
          <SecurityActiveDevices />
        </Security>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/^password/i));
      screen.getByText(/active devices/i);
      expect(queryByText(/^passkeys/i)).not.toBeInTheDocument();
      expect(queryByText(/delete account/i)).not.toBeInTheDocument();
    });

    it('SecurityActiveDevices renders without guard', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(
        <Security>
          <SecurityActiveDevices />
        </Security>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/active devices/i));
    });

    it('SecurityDelete respects user flag', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: false });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      const { queryByText } = render(
        <Security>
          <SecurityDelete />
          <SecurityActiveDevices />
        </Security>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/active devices/i));
      expect(queryByText(/delete account/i)).not.toBeInTheDocument();
    });
  });
});
