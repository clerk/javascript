import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { PhoneNumberResource, TOTPResource } from '@clerk/shared/types';
import { describe, expect, it, test, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, screen, waitFor } from '@/test/utils';

import { TaskSetupMFA } from '../index';

const { createFixtures } = bindCreateFixtures('TaskSetupMFA');

describe('TaskSetupMFA', () => {
  describe('task guard', () => {
    it('does not render component without existing session task', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
        });
        f.withAuthenticatorApp();
      });

      const { queryByText, queryByRole } = render(<TaskSetupMFA />, { wrapper });

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
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const { queryByText, queryByRole } = render(<TaskSetupMFA />, { wrapper });

      expect(queryByText('Set up two-step verification')).toBeInTheDocument();
      expect(queryByRole('link', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  describe('main flow', () => {
    it('should render SMS code and TOTP items on the first screen if both are enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const { getByRole } = render(<TaskSetupMFA />, { wrapper });

      expect(getByRole('button', { name: /authenticator application/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /sms code/i })).toBeInTheDocument();
    });

    it('should skip selection screen and go directly to SMS code flow when only SMS code is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const { findByText, queryByText } = render(<TaskSetupMFA />, { wrapper });

      await findByText(/add phone number/i);
      expect(queryByText(/set up two-step verification/i)).not.toBeInTheDocument();
    });

    it('should skip selection screen and go directly to TOTP flow when only TOTP is enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      const { findByText, queryByText } = render(<TaskSetupMFA />, { wrapper });

      await findByText(/add authenticator application/i);
      expect(queryByText(/set up two-step verification/i)).not.toBeInTheDocument();
    });
  });
  describe('authenticator application', () => {
    it('should render the initial screen with the qr code', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);
      await findByText(/scan the following QR code/i);
      expect(getByRole('button', { name: /can't scan qr code/i })).toBeInTheDocument();
    });

    test('clicking the "cant scan qr code" button should render the screen with the uri', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      const { getByRole, findByText, userEvent, queryByText } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /can't scan qr code/i }));
      });

      await findByText(/Set up a new sign-in method in your authenticator and enter the Key provided below/i);
      expect(queryByText(/scan the following QR code/i)).not.toBeInTheDocument();
      expect(getByRole('button', { name: /scan qr code instead/i })).toBeInTheDocument();
    });

    test('clicking continue button should navigate to the verification screen', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      const { getByRole, findByText, findByLabelText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /continue/i }));
      });

      await findByText(/enter verification code generated by your authenticator/i);
      await findByLabelText(/verification code/i);
    });

    test('completing TOTP verification should show success screen with backup codes', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
        f.withBackupCode();
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      fixtures.clerk.user?.verifyTOTP.mockResolvedValue({
        backupCodes: ['code1', 'code2', 'code3'],
      } as TOTPResource);

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /continue/i }));
      });

      await findByText(/enter verification code generated by your authenticator/i);

      await userEvent.type(screen.getByLabelText(/verification code/i), '123456');

      await waitFor(() => {
        expect(fixtures.clerk.user?.verifyTOTP).toHaveBeenCalledWith({ code: '123456' });
      });

      await findByText(/authenticator application verification enabled/i);
      await findByText(/save these backup codes/i);
    });

    test('completing TOTP verification should show simple success screen when backup codes are not enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      fixtures.clerk.user?.verifyTOTP.mockResolvedValue({} as TOTPResource);

      const { getByRole, findByText, queryByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /continue/i }));
      });

      await findByText(/enter verification code generated by your authenticator/i);

      await userEvent.type(screen.getByLabelText(/verification code/i), '123456');

      await waitFor(() => {
        expect(fixtures.clerk.user?.verifyTOTP).toHaveBeenCalledWith({ code: '123456' });
      });

      await findByText(/authenticator application verification enabled/i);
      expect(queryByText(/save these backup codes/i)).not.toBeInTheDocument();
    });

    test('clicking "scan qr code instead" should switch back from URI view to QR code', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      const { getByRole, findByText, queryByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);

      // Switch to URI view
      await act(async () => {
        await userEvent.click(getByRole('button', { name: /can't scan qr code/i }));
      });

      await findByText(/Set up a new sign-in method in your authenticator and enter the Key provided below/i);
      expect(queryByText(/scan the following QR code/i)).not.toBeInTheDocument();

      // Switch back to QR code view
      await act(async () => {
        await userEvent.click(getByRole('button', { name: /scan qr code instead/i }));
      });

      await findByText(/scan the following QR code/i);
      expect(
        queryByText(/Set up a new sign-in method in your authenticator and enter the Key provided below/i),
      ).not.toBeInTheDocument();
      expect(getByRole('button', { name: /can't scan qr code/i })).toBeInTheDocument();
    });

    it('should navigate back to main selection when clicking cancel from TOTP flow', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /cancel/i }));
      });

      // Should be back on main selection screen
      expect(getByRole('button', { name: /authenticator application/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /sms code/i })).toBeInTheDocument();
    });

    it('should display error when createTOTP fails', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'totp_already_enabled',
              long_message: 'TOTP is already enabled for this user',
              message: 'TOTP already enabled',
              meta: {},
            },
          ],
          status: 422,
        }),
      );

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/TOTP is already enabled for this user/i);
    });

    it('should display error when verifyTOTP fails with incorrect code', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createTOTP.mockResolvedValue({
        uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
        secret: 'TESTSECRET',
      } as TOTPResource);

      fixtures.clerk.user?.verifyTOTP.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'form_code_incorrect',
              long_message: 'Incorrect authenticator code',
              message: 'is incorrect',
              meta: { param_name: 'code' },
            },
          ],
          status: 422,
        }),
      );

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /authenticator application/i }));
      });

      await findByText(/add authenticator application/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /continue/i }));
      });

      await findByText(/enter verification code generated by your authenticator/i);

      await userEvent.type(screen.getByLabelText(/verification code/i), '123456');

      await waitFor(() => {
        expect(fixtures.clerk.user?.verifyTOTP).toHaveBeenCalledWith({ code: '123456' });
      });

      expect(await screen.findByTestId('form-feedback-error')).toHaveTextContent(/Incorrect authenticator code/i);
    });
  });

  describe('sms code', () => {
    it('should render the phone selection screen when clicking SMS code button', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [{ phone_number: '+306911111111', id: 'phone_1' }],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);
      await findByText(/choose phone number you want to use/i);
      await findByText(/\+30 691 1111111/i);
      expect(getByRole('menuitem', { name: /add phone number/i })).toBeInTheDocument();
    });

    it('should show add phone screen when no existing phone numbers', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add phone number/i);
      await findByText(/a text message containing a verification code/i);
    });

    it('clicking add phone number should navigate to add phone screen', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [{ phone_number: '+306911111111', id: 'phone_1' }],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      await act(async () => {
        await userEvent.click(getByRole('menuitem', { name: /add phone number/i }));
      });

      await findByText(/add phone number/i);
      await findByText(/a text message containing a verification code/i);
    });

    test('completing SMS code verification should show success screen with backup codes', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [
            {
              phone_number: '+306911111111',
              id: 'phone_1',
              verification: { status: 'verified', strategy: 'phone_code' },
            },
          ],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
        f.withBackupCode();
      });

      fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor.mockResolvedValue({
        backupCodes: ['code1', 'code2', 'code3'],
      } as PhoneNumberResource);

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /\+30 691 1111111/i }));
      });

      expect(fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor).toHaveBeenCalledWith({
        reserved: true,
      });

      await findByText(/sms code verification enabled/i);
      await findByText(/save these backup codes/i);
    });

    test('completing SMS code verification should show simple success screen when backup codes are not enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [
            {
              phone_number: '+306911111111',
              id: 'phone_1',
              verification: { status: 'verified', strategy: 'phone_code' },
            },
          ],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor.mockResolvedValue({} as PhoneNumberResource);

      const { getByRole, findByText, queryByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /\+30 691 1111111/i }));
      });

      expect(fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor).toHaveBeenCalledWith({
        reserved: true,
      });

      await findByText(/sms code verification enabled/i);
      expect(queryByText(/save these backup codes/i)).not.toBeInTheDocument();
    });

    it('should not display phones already reserved for 2FA', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [
            {
              phone_number: '+306911111111',
              id: 'phone_1',
              verification: { status: 'verified', strategy: 'phone_code' },
              reserved_for_second_factor: true,
            },
            {
              phone_number: '+306922222222',
              id: 'phone_2',
              verification: { status: 'verified', strategy: 'phone_code' },
              reserved_for_second_factor: false,
            },
          ],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const { getByRole, findByText, queryByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      // Phone already reserved for 2FA should not be shown
      expect(queryByText(/\+30 691 1111111/i)).not.toBeInTheDocument();
      // Phone not reserved should be shown
      await findByText(/\+30 692 2222222/i);
    });

    it('should navigate back to main selection when clicking cancel from SMS code flow', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [{ phone_number: '+306911111111', id: 'phone_1' }],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
        f.withAuthenticatorApp({ enabled: true });
      });

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /cancel/i }));
      });

      // Should be back on main selection screen
      expect(getByRole('button', { name: /authenticator application/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /sms code/i })).toBeInTheDocument();
    });

    it('should display error when setReservedForSecondFactor fails', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [
            {
              phone_number: '+306911111111',
              id: 'phone_1',
              verification: { status: 'verified', strategy: 'phone_code' },
            },
          ],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'identification_update_failed',
              long_message: 'You cannot set your last identification as second factor.',
              message: 'Update failed',
              meta: {},
            },
          ],
          status: 422,
        }),
      );

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /\+30 691 1111111/i }));
      });

      expect(fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor).toHaveBeenCalledWith({
        reserved: true,
      });

      await findByText(/You cannot set your last identification as second factor/i);
    });

    it('should allow adding a new phone number and navigate to verification', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      const mockPhoneResource = {
        id: 'phone_new',
        phoneNumber: '+16505551234',
        prepareVerification: vi.fn().mockResolvedValue({}),
      } as unknown as PhoneNumberResource;

      fixtures.clerk.user?.createPhoneNumber.mockResolvedValue(mockPhoneResource);

      const { getByRole, findByText, getByLabelText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      // Should go directly to add phone screen since user has no phones
      await findByText(/add phone number/i);

      await userEvent.type(getByLabelText(/phone number/i), '6505551234');

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /continue/i }));
      });

      expect(fixtures.clerk.user?.createPhoneNumber).toHaveBeenCalledWith({
        phoneNumber: expect.stringContaining('6505551234'),
      });

      // Should navigate to verification screen
      await findByText(/enter the verification code/i);
    });

    it('should display error when createPhoneNumber fails', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.createPhoneNumber.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'phone_number_exists',
              long_message: 'This phone number is already associated with another account.',
              message: 'Phone number exists',
              meta: {},
            },
          ],
          status: 422,
        }),
      );

      const { getByRole, findByText, getByLabelText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add phone number/i);

      await userEvent.type(getByLabelText(/phone number/i), '6505551234');

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /continue/i }));
      });

      await findByText(/This phone number is already associated with another account/i);
    });

    it('should verify phone with code and show success', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [
            {
              phone_number: '+306911111111',
              id: 'phone_1',
              verification: { status: 'unverified', strategy: 'phone_code' },
            },
          ],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.phoneNumbers[0].prepareVerification.mockResolvedValue({} as PhoneNumberResource);
      fixtures.clerk.user?.phoneNumbers[0].attemptVerification.mockResolvedValue({} as PhoneNumberResource);
      fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor.mockResolvedValue({} as PhoneNumberResource);

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      // Click unverified phone to go to verification
      await act(async () => {
        await userEvent.click(getByRole('button', { name: /\+30 691 1111111/i }));
      });

      await findByText(/enter the verification code/i);

      // Enter verification code
      await userEvent.type(screen.getByLabelText(/verification code/i), '123456');

      await waitFor(() => {
        expect(fixtures.clerk.user?.phoneNumbers[0].attemptVerification).toHaveBeenCalledWith({ code: '123456' });
      });

      await waitFor(() => {
        expect(fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor).toHaveBeenCalledWith({
          reserved: true,
        });
      });

      await findByText(/sms code verification enabled/i);
    });

    it('should display error when phone verification code is incorrect', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          identifier: 'test@clerk.com',
          phone_numbers: [
            {
              phone_number: '+306911111111',
              id: 'phone_1',
              verification: { status: 'unverified', strategy: 'phone_code' },
            },
          ],
          tasks: [{ key: 'setup-mfa' }],
        });
        f.withAuthenticatorApp({ enabled: true });
        f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      });

      fixtures.clerk.user?.phoneNumbers[0].prepareVerification.mockResolvedValue({} as PhoneNumberResource);
      fixtures.clerk.user?.phoneNumbers[0].attemptVerification.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'form_code_incorrect',
              long_message: 'Incorrect phone code',
              message: 'is incorrect',
              meta: { param_name: 'code' },
            },
          ],
          status: 422,
        }),
      );

      const { getByRole, findByText, userEvent } = render(<TaskSetupMFA />, { wrapper });

      await act(async () => {
        await userEvent.click(getByRole('button', { name: /sms code/i }));
      });

      await findByText(/add sms code verification/i);

      // Click unverified phone to go to verification
      await act(async () => {
        await userEvent.click(getByRole('button', { name: /\+30 691 1111111/i }));
      });

      await findByText(/enter the verification code/i);

      // Enter incorrect verification code
      await userEvent.type(screen.getByLabelText(/verification code/i), '000000');

      await waitFor(() => {
        expect(fixtures.clerk.user?.phoneNumbers[0].attemptVerification).toHaveBeenCalledWith({ code: '000000' });
      });

      expect(await screen.findByTestId('form-feedback-error')).toHaveTextContent(/Incorrect phone code/i);
    });
  });
});
