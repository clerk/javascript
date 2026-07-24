import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { clearFetchCache } from '../../../hooks';
import { SecurityPassword, SecurityPasskeys, SecurityMfa, SecurityDelete } from '../SecuritySections';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('SecuritySections — self-gating visibility', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  describe('SecurityPassword', () => {
    it('renders when instance is password-based', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPassword();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(
        <CardStateProvider>
          <SecurityPassword />
        </CardStateProvider>,
        { wrapper },
      );
      screen.getByText(/^password/i);
    });

    it('returns null when instance is not password-based', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<SecurityPassword />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('SecurityPasskeys', () => {
    it('renders when passkeys are enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPasskey();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(
        <CardStateProvider>
          <SecurityPasskeys />
        </CardStateProvider>,
        { wrapper },
      );
      screen.getByText(/^passkeys/i);
    });

    it('returns null when passkeys are disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<SecurityPasskeys />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('SecurityMfa', () => {
    it('renders when second factors are available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber({ used_for_second_factor: true, second_factors: ['phone_code'] });
        f.withUser({ email_addresses: ['test@clerk.com'], phone_numbers: ['+11111111111'] });
      });

      render(
        <CardStateProvider>
          <SecurityMfa />
        </CardStateProvider>,
        { wrapper },
      );
      expect(screen.getAllByText(/two-step verification/i).length).toBeGreaterThan(0);
    });

    it('returns null when no second factors are available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<SecurityMfa />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('SecurityDelete', () => {
    it('renders when delete_self_enabled is true', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: true });
      });

      render(<SecurityDelete />, { wrapper });
      expect(screen.getAllByText(/delete account/i).length).toBeGreaterThan(0);
    });

    it('returns null when delete_self_enabled is false', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], delete_self_enabled: false });
      });

      const { container } = render(<SecurityDelete />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });
});
