import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { TaskSetupMfa } from '..';

const { createFixtures } = bindCreateFixtures('TaskSetupMfa');

describe('TaskSetupMfa', () => {
  describe('Task Guard', () => {
    it('does not render component without existing session task', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
        });
        f.withAuthenticatorApp();
      });

      const { queryByText, queryByRole } = render(<TaskSetupMfa />, { wrapper });

      expect(queryByText('Set up two-step verification')).not.toBeInTheDocument();
      expect(queryByRole('link', { name: /sign out/i })).not.toBeInTheDocument();
    });

    it('renders component when session task exists', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
      });

      const { findByText } = render(<TaskSetupMfa />, { wrapper });

      expect(await findByText('Set up two-step verification')).toBeInTheDocument();
    });
  });

  describe('Method Selection', () => {
    it('shows method selection screen when multiple methods available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
        f.withPhoneNumber({ second_factors: ['phone_code'] });
      });

      const { findByText, findByRole } = render(<TaskSetupMfa />, { wrapper });

      expect(await findByText('Set up two-step verification')).toBeInTheDocument();
      expect(await findByText('Protect your account with an extra layer of security')).toBeInTheDocument();
      expect(await findByRole('button', { name: /authenticator app/i })).toBeInTheDocument();
      expect(await findByRole('button', { name: /sms code/i })).toBeInTheDocument();
    });

    it('auto-selects method when only one available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
      });

      const { findByText, queryByRole } = render(<TaskSetupMfa />, { wrapper });

      // Should not show method selection screen
      expect(queryByRole('button', { name: /authenticator app/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /sms code/i })).not.toBeInTheDocument();

      // Should directly show the TOTP setup form
      await waitFor(() => expect(findByText(/Add authenticator app/i)).toBeTruthy());
    });

    it('allows user to select TOTP method from multiple options', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
        f.withPhoneNumber({ second_factors: ['phone_code'] });
      });

      const { findByText, findByRole, userEvent } = render(<TaskSetupMfa />, { wrapper });

      const totpButton = await findByRole('button', { name: /authenticator app/i });

      await act(async () => {
        await userEvent.click(totpButton);
      });

      // Should navigate to TOTP setup
      await waitFor(() => expect(findByText(/Add authenticator app/i)).toBeTruthy());
    });

    it('allows user to select phone code method from multiple options', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
        f.withPhoneNumber({ second_factors: ['phone_code'] });
      });

      const { findByRole, userEvent, queryByText } = render(<TaskSetupMfa />, { wrapper });

      const phoneCodeButton = await findByRole('button', { name: /sms code/i });

      await act(async () => {
        await userEvent.click(phoneCodeButton);
      });

      // Should navigate to phone code setup
      await waitFor(() => {
        expect(queryByText(/Add SMS code/i)).toBeInTheDocument();
      });
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
        f.withAuthenticatorApp();
        f.withPhoneNumber({ second_factors: ['phone_code'] });
      });

      const { findByText } = render(<TaskSetupMfa />, { wrapper });

      expect(await findByText(/user@test\.com/)).toBeInTheDocument();
      expect(await findByText('Sign out')).toBeInTheDocument();
    });

    it('renders with username when email is not available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          username: 'testuser',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
      });

      const { findByText } = render(<TaskSetupMfa />, { wrapper });

      expect(await findByText(/testuser/)).toBeInTheDocument();
    });

    it('handles sign out correctly with single session', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
      });

      const { findByRole, userEvent } = render(<TaskSetupMfa />, { wrapper });
      const signOutButton = await findByRole('link', { name: /sign out/i });

      await act(async () => {
        await userEvent.click(signOutButton);
      });

      expect(fixtures.clerk.signOut).toHaveBeenCalled();
    });
  });

  describe('Method Availability', () => {
    it('shows only TOTP when only authenticator app is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
      });

      const { queryByRole } = render(<TaskSetupMfa />, { wrapper });

      // Should auto-select TOTP and not show method selection
      expect(queryByRole('button', { name: /authenticator app/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /sms code/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /backup code/i })).not.toBeInTheDocument();
    });

    it('shows only phone code when only SMS is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withPhoneNumber({ second_factors: ['phone_code'] });
      });

      const { queryByRole, queryByText } = render(<TaskSetupMfa />, { wrapper });

      // Should auto-select phone code and not show method selection
      expect(queryByRole('button', { name: /authenticator app/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /sms code/i })).not.toBeInTheDocument();

      // Should show phone code setup
      await waitFor(() => {
        expect(queryByText(/Add SMS code/i)).toBeInTheDocument();
      });
    });

    it('shows both TOTP and phone code when both are enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
        f.withPhoneNumber({ second_factors: ['phone_code'] });
      });

      const { findByRole } = render(<TaskSetupMfa />, { wrapper });

      expect(await findByRole('button', { name: /authenticator app/i })).toBeInTheDocument();
      expect(await findByRole('button', { name: /sms code/i })).toBeInTheDocument();
    });

    it('includes backup codes in method selection when available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
        f.withPhoneNumber({ second_factors: ['phone_code'] });
        f.withBackupCode();
      });

      const { findByRole } = render(<TaskSetupMfa />, { wrapper });

      expect(await findByRole('button', { name: /authenticator app/i })).toBeInTheDocument();
      expect(await findByRole('button', { name: /sms code/i })).toBeInTheDocument();
      expect(await findByRole('button', { name: /backup code/i })).toBeInTheDocument();
    });
  });

  describe('Task Completion', () => {
    it('calls setActive after successful MFA setup', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp();
      });

      // Mock the TOTP creation and verification
      const mockTOTP = {
        id: 'totp_123',
        secret: 'secret',
        uri: 'otpauth://totp/test',
        verified: false,
        backup_codes: [],
      };

      const mockVerifiedTOTP = {
        ...mockTOTP,
        verified: true,
        backup_codes: ['code1', 'code2', 'code3'],
      };

      fixtures.clerk.user!.createTOTP = vi.fn().mockResolvedValue(mockTOTP);
      fixtures.clerk.user!.verifyTOTP = vi.fn().mockResolvedValue(mockVerifiedTOTP);

      const { findByRole, findByLabelText, userEvent } = render(<TaskSetupMfa />, { wrapper });

      // Should be on TOTP setup page (auto-selected)
      const continueButton = await findByRole('button', { name: /continue/i });

      await act(async () => {
        await userEvent.click(continueButton);
      });

      // Wait for verification step
      await waitFor(() => findByLabelText(/enter verification code/i));

      const codeInput = await findByLabelText(/enter verification code/i);

      await act(async () => {
        await userEvent.type(codeInput, '123456');
      });

      const verifyButton = await findByRole('button', { name: /continue/i });

      await act(async () => {
        await userEvent.click(verifyButton);
      });

      // Wait for backup codes to appear
      await waitFor(() => findByRole('button', { name: /continue/i }));

      const finalContinueButton = await findByRole('button', { name: /continue/i });

      await act(async () => {
        await userEvent.click(finalContinueButton);
      });

      // Should call setActive to complete the task
      await waitFor(() => {
        expect(fixtures.clerk.setActive).toHaveBeenCalled();
      });
    });
  });
});
