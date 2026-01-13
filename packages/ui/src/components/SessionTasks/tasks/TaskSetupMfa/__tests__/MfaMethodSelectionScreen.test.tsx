import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { MfaMethodSelectionScreen } from '../MfaMethodSelectionScreen';

const { createFixtures } = bindCreateFixtures('TaskSetupMfa');

describe('MfaMethodSelectionScreen', () => {
  describe('Rendering', () => {
    it('renders title and subtitle', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByText } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp', 'phone_code']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      expect(await findByText('Set up two-step verification')).toBeInTheDocument();
      expect(await findByText('Protect your account with an extra layer of security')).toBeInTheDocument();
    });

    it('renders all provided method buttons', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByRole } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp', 'phone_code', 'backup_code']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      expect(await findByRole('button', { name: /authenticator app/i })).toBeInTheDocument();
      expect(await findByRole('button', { name: /sms code/i })).toBeInTheDocument();
      expect(await findByRole('button', { name: /backup code/i })).toBeInTheDocument();
    });

    it('renders only TOTP button when only totp is available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByRole, queryByRole } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      expect(await findByRole('button', { name: /authenticator app/i })).toBeInTheDocument();
      expect(queryByRole('button', { name: /sms code/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /backup code/i })).not.toBeInTheDocument();
    });

    it('renders only phone code button when only phone_code is available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByRole, queryByRole } = render(
        <MfaMethodSelectionScreen
          availableMethods={['phone_code']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      expect(await findByRole('button', { name: /sms code/i })).toBeInTheDocument();
      expect(queryByRole('button', { name: /authenticator app/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /backup code/i })).not.toBeInTheDocument();
    });
  });

  describe('Method Selection', () => {
    it('calls onMethodSelect with correct method when TOTP is clicked', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByRole, userEvent } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp', 'phone_code']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      const totpButton = await findByRole('button', { name: /authenticator app/i });

      await act(async () => {
        await userEvent.click(totpButton);
      });

      expect(onMethodSelect).toHaveBeenCalledWith('totp');
    });

    it('calls onMethodSelect with correct method when phone code is clicked', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByRole, userEvent } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp', 'phone_code']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      const phoneCodeButton = await findByRole('button', { name: /sms code/i });

      await act(async () => {
        await userEvent.click(phoneCodeButton);
      });

      expect(onMethodSelect).toHaveBeenCalledWith('phone_code');
    });

    it('calls onMethodSelect with correct method when backup code is clicked', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByRole, userEvent } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp', 'phone_code', 'backup_code']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      const backupCodeButton = await findByRole('button', { name: /backup code/i });

      await act(async () => {
        await userEvent.click(backupCodeButton);
      });

      expect(onMethodSelect).toHaveBeenCalledWith('backup_code');
    });
  });

  describe('Sign Out', () => {
    it('displays user identifier in sign out section', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['user@test.com'],
          identifier: 'user@test.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByText } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      expect(await findByText(/user@test\.com/)).toBeInTheDocument();
      expect(await findByText('Sign out')).toBeInTheDocument();
    });

    it('displays username when email is not available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          username: 'testuser',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByText } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      expect(await findByText(/testuser/)).toBeInTheDocument();
    });

    it('handles sign out correctly with single session', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByRole, userEvent } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      const signOutButton = await findByRole('link', { name: /sign out/i });

      await act(async () => {
        await userEvent.click(signOutButton);
      });

      expect(fixtures.clerk.signOut).toHaveBeenCalled();
    });

    it('does not display identifier when neither email nor username is available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          tasks: [{ key: 'setup-mfa' }],
        });
      });

      const onMethodSelect = vi.fn();
      const { findByText, queryByText } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      expect(await findByText('Sign out')).toBeInTheDocument();
      // Should not show "Signed in as" text when no identifier
      expect(queryByText(/Signed in as/)).not.toBeInTheDocument();
    });
  });

  describe('Multiple Sessions', () => {
    it('handles sign out with multiple sessions correctly', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withMultipleSessions();
      });

      const onMethodSelect = vi.fn();
      const { findByRole, userEvent } = render(
        <MfaMethodSelectionScreen
          availableMethods={['totp']}
          onMethodSelect={onMethodSelect}
        />,
        { wrapper },
      );

      const signOutButton = await findByRole('link', { name: /sign out/i });

      await act(async () => {
        await userEvent.click(signOutButton);
      });

      expect(fixtures.clerk.signOut).toHaveBeenCalled();
      // Should pass sessionId when multiple sessions exist
      expect(fixtures.clerk.signOut).toHaveBeenCalledWith(expect.anything(), {
        sessionId: expect.any(String),
      });
    });
  });
});
