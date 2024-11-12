import { describe, it } from '@jest/globals';

import { fireEvent, render, screen, waitFor } from '../../../../testUtils';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { runFakeTimers } from '../../../utils/test/runFakeTimers';
import { PasswordSection } from '../PasswordSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withUser({});
});

const updatePasswordConfig = createFixtures.config(f => {
  f.withUser({ password_enabled: true });
});

describe('PasswordSection', () => {
  it('renders the section with set button', async () => {
    const { wrapper } = await createFixtures(initConfig);

    const { getByText, getByRole } = render(
      <CardStateProvider>
        <PasswordSection />
      </CardStateProvider>,
      { wrapper },
    );
    getByText(/^Password/i);
    getByRole('button', { name: /set password/i });
  });

  it('renders the section with update button', async () => {
    const { wrapper } = await createFixtures(updatePasswordConfig);

    const { getByText, getByRole } = render(
      <CardStateProvider>
        <PasswordSection />
      </CardStateProvider>,
      { wrapper },
    );
    getByText(/^Password/i);
    getByRole('button', { name: /update password/i });
  });

  describe('Set password', () => {
    it('renders the set password screen', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { getByRole, userEvent, getByLabelText } = render(<PasswordSection />, { wrapper });

      await userEvent.click(getByRole('button', { name: /set password/i }));
      await waitFor(() => getByRole('heading', { name: /set password/i }));

      getByLabelText(/new password/i);
      getByLabelText(/confirm password/i);
      getByLabelText(/Sign out of all other devices/i);
      getByLabelText(/It is recommended to sign out of all other devices which may have used your old password./i);
    });

    it('sets a new password and calls the appropriate function and closes', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.clerk.user?.updatePassword.mockResolvedValue({});
      const { getByRole, userEvent, getByLabelText, queryByRole } = render(<PasswordSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: /set password/i }));
      await waitFor(() => getByRole('heading', { name: /set password/i }));

      await userEvent.type(getByLabelText(/new password/i), 'testtest');
      await userEvent.type(getByLabelText(/confirm password/i), 'testtest');
      await userEvent.click(getByRole('button', { name: /save$/i }));
      expect(fixtures.clerk.user?.updatePassword).toHaveBeenCalledWith({
        newPassword: 'testtest',
        signOutOfOtherSessions: true,
      });
      await waitFor(() => getByRole('button', { name: /set password/i }));
      expect(queryByRole('heading', { name: /set password/i })).not.toBeInTheDocument();
    });

    it('renders a hidden identifier field', async () => {
      const { wrapper } = await createFixtures(initConfig);
      const { getByRole, userEvent } = render(<PasswordSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: /set password/i }));
      await waitFor(() => getByRole('heading', { name: /set password/i }));

      const identifierField: HTMLInputElement = screen.getByTestId('hidden-identifier');
      expect(identifierField.value).toBe('email@test.com');
    });

    it('updates passwords and leave other sessions intact', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.clerk.user?.updatePassword.mockResolvedValue({});
      const { userEvent, getByRole, getByLabelText } = render(<PasswordSection />, { wrapper });

      await userEvent.click(getByRole('button', { name: /set password/i }));
      await waitFor(() => getByRole('heading', { name: /set password/i }));

      await userEvent.type(getByLabelText(/new password/i), 'testtest');
      await userEvent.type(getByLabelText(/confirm password/i), 'testtest');
      await userEvent.click(getByRole('checkbox', { name: /sign out of all other devices/i }));
      await userEvent.click(getByRole('button', { name: /save$/i }));
      expect(fixtures.clerk.user?.updatePassword).toHaveBeenCalledWith({
        newPassword: 'testtest',
        signOutOfOtherSessions: false,
      });
    });

    describe('with SAML', () => {
      it('prevents setting a password if user has active enterprise connections', async () => {
        const emailAddress = 'george@jungle.com';

        const config = createFixtures.config(f => {
          f.withEmailAddress();
          f.withSaml();
          f.withUser({
            email_addresses: [emailAddress],
            enterprise_accounts: [
              {
                object: 'enterprise_account',
                active: true,
                first_name: 'Laura',
                last_name: 'Serafim',
                protocol: 'saml',
                provider_user_id: null,
                public_metadata: {},
                email_address: 'test@clerk.com',
                provider: 'saml_okta',
                enterprise_connection: {
                  object: 'enterprise_connection',
                  provider: 'saml_okta',
                  name: 'FooCorp',
                  id: 'ent_123',
                  active: true,
                  allow_idp_initiated: false,
                  allow_subdomains: false,
                  disable_additional_identifications: false,
                  sync_user_attributes: false,
                  domain: 'foocorp.com',
                  created_at: 123,
                  updated_at: 123,
                  logo_public_url: null,
                  protocol: 'saml',
                },
                verification: {
                  status: 'verified',
                  strategy: 'saml',
                  verified_at_client: 'foo',
                  attempts: 0,
                  error: {
                    code: 'identifier_already_signed_in',
                    long_message: "You're already signed in",
                    message: "You're already signed in",
                  },
                  expire_at: 123,
                  id: 'ver_123',
                  object: 'verification',
                },
                id: 'eac_123',
              },
            ],
          });
        });

        const { wrapper } = await createFixtures(config);

        const { getByRole, userEvent, getByLabelText } = render(<PasswordSection />, { wrapper });

        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));

        expect(getByLabelText(/new password/i)).toBeDisabled();
        expect(getByLabelText(/confirm password/i)).toBeDisabled();
        expect(getByRole('checkbox', { name: /sign out of all other devices/i })).toBeDisabled();

        expect(
          screen.getByText(
            'Your password can currently not be edited because you can sign in only via the enterprise connection.',
          ),
        ).toBeInTheDocument();
      });

      it('does not prevent adding a password if user has no active enterprise connections', async () => {
        const emailAddress = 'george@jungle.com';

        const config = createFixtures.config(f => {
          f.withEmailAddress();
          f.withSaml();
          f.withUser({
            email_addresses: [emailAddress],
            enterprise_accounts: [
              {
                object: 'enterprise_account',
                active: false,
                first_name: 'Laura',
                last_name: 'Serafim',
                protocol: 'saml',
                provider_user_id: null,
                public_metadata: {},
                email_address: 'test@clerk.com',
                provider: 'saml_okta',
                enterprise_connection: {
                  object: 'enterprise_connection',
                  provider: 'saml_okta',
                  name: 'FooCorp',
                  id: 'ent_123',
                  active: false,
                  allow_idp_initiated: false,
                  allow_subdomains: false,
                  disable_additional_identifications: false,
                  sync_user_attributes: false,
                  domain: 'foocorp.com',
                  created_at: 123,
                  updated_at: 123,
                  logo_public_url: null,
                  protocol: 'saml',
                },
                verification: {
                  status: 'verified',
                  strategy: 'saml',
                  verified_at_client: 'foo',
                  attempts: 0,
                  error: {
                    code: 'identifier_already_signed_in',
                    long_message: "You're already signed in",
                    message: "You're already signed in",
                  },
                  expire_at: 123,
                  id: 'ver_123',
                  object: 'verification',
                },
                id: 'eac_123',
              },
            ],
          });
        });

        const { wrapper } = await createFixtures(config);

        const { getByRole, userEvent, getByLabelText } = render(<PasswordSection />, { wrapper });

        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));

        expect(getByLabelText(/new password/i)).not.toBeDisabled();
        expect(getByLabelText(/confirm password/i)).not.toBeDisabled();
        expect(getByRole('checkbox', { name: /sign out of all other devices/i })).not.toBeDisabled();

        expect(
          screen.queryByText(
            'Your password can currently not be edited because you can sign in only via the enterprise connection.',
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe('Form buttons', () => {
      it('save button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        const { getByRole, userEvent } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));

        expect(getByRole('button', { name: /save$/i })).toBeDisabled();
      });
      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent, getByRole, queryByRole } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));
        expect(queryByRole('button', { name: /set password/i })).not.toBeInTheDocument();

        await userEvent.click(getByRole('button', { name: /cancel$/i }));
        await waitFor(() => getByRole('button', { name: /set password/i }));
        expect(queryByRole('heading', { name: /set password/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Update password', () => {
    it('renders the set password screen', async () => {
      const { wrapper } = await createFixtures(updatePasswordConfig);

      const { getByRole, userEvent, getByLabelText } = render(<PasswordSection />, { wrapper });

      await userEvent.click(getByRole('button', { name: /update password/i }));
      await waitFor(() => getByRole('heading', { name: /update password/i }));

      getByLabelText(/current password/i);
      getByLabelText(/new password/i);
      getByLabelText(/confirm password/i);
      getByLabelText(/Sign out of all other devices/i);
      getByLabelText(/It is recommended to sign out of all other devices which may have used your old password./i);
    });

    it('changes a new password and calls the appropriate function and closes', async () => {
      const { wrapper, fixtures } = await createFixtures(updatePasswordConfig);

      fixtures.clerk.user?.updatePassword.mockResolvedValue({});
      const { getByRole, userEvent, getByLabelText, queryByRole } = render(<PasswordSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: /update password/i }));
      await waitFor(() => getByRole('heading', { name: /update password/i }));

      await userEvent.type(getByLabelText(/current password/i), 'testtest1234');
      await userEvent.type(getByLabelText(/new password/i), 'testtest');
      await userEvent.type(getByLabelText(/confirm password/i), 'testtest');
      await userEvent.click(getByRole('button', { name: /save$/i }));
      expect(fixtures.clerk.user?.updatePassword).toHaveBeenCalledWith({
        currentPassword: 'testtest1234',
        newPassword: 'testtest',
        signOutOfOtherSessions: true,
      });
      await waitFor(() => getByRole('button', { name: /update password/i }));
      expect(queryByRole('heading', { name: /update password/i })).not.toBeInTheDocument();
    });

    describe('with SAML', () => {
      it('prevents changing a password if user has active enterprise connections', async () => {
        const emailAddress = 'george@jungle.com';

        const config = createFixtures.config(f => {
          f.withEmailAddress();
          f.withSaml();
          f.withUser({
            password_enabled: true,
            email_addresses: [emailAddress],
            enterprise_accounts: [
              {
                object: 'enterprise_account',
                active: true,
                first_name: 'Laura',
                last_name: 'Serafim',
                protocol: 'saml',
                provider_user_id: null,
                public_metadata: {},
                email_address: 'test@clerk.com',
                provider: 'saml_okta',
                enterprise_connection: {
                  object: 'enterprise_connection',
                  provider: 'saml_okta',
                  name: 'FooCorp',
                  id: 'ent_123',
                  active: true,
                  allow_idp_initiated: false,
                  allow_subdomains: false,
                  disable_additional_identifications: false,
                  sync_user_attributes: false,
                  domain: 'foocorp.com',
                  created_at: 123,
                  updated_at: 123,
                  logo_public_url: null,
                  protocol: 'saml',
                },
                verification: {
                  status: 'verified',
                  strategy: 'saml',
                  verified_at_client: 'foo',
                  attempts: 0,
                  error: {
                    code: 'identifier_already_signed_in',
                    long_message: "You're already signed in",
                    message: "You're already signed in",
                  },
                  expire_at: 123,
                  id: 'ver_123',
                  object: 'verification',
                },
                id: 'eac_123',
              },
            ],
          });
        });

        const { wrapper } = await createFixtures(config);

        const { getByRole, userEvent, getByLabelText } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /update password/i }));
        await waitFor(() => getByRole('heading', { name: /update password/i }));

        expect(getByLabelText(/current password/i)).toBeDisabled();
        expect(getByLabelText(/new password/i)).toBeDisabled();
        expect(getByLabelText(/confirm password/i)).toBeDisabled();
        expect(getByRole('checkbox', { name: /sign out of all other devices/i })).toBeDisabled();

        expect(
          screen.getByText(
            'Your password can currently not be edited because you can sign in only via the enterprise connection.',
          ),
        ).toBeInTheDocument();
      });

      it('does not prevent changing a password if user has no active enterprise connections', async () => {
        const emailAddress = 'george@jungle.com';

        const config = createFixtures.config(f => {
          f.withEmailAddress();
          f.withSaml();
          f.withUser({
            password_enabled: true,
            email_addresses: [emailAddress],
            enterprise_accounts: [
              {
                object: 'enterprise_account',
                active: false,
                first_name: 'Laura',
                last_name: 'Serafim',
                protocol: 'saml',
                provider_user_id: null,
                public_metadata: {},
                email_address: 'test@clerk.com',
                provider: 'saml_okta',
                enterprise_connection: {
                  object: 'enterprise_connection',
                  provider: 'saml_okta',
                  name: 'FooCorp',
                  id: 'ent_123',
                  active: false,
                  allow_idp_initiated: false,
                  allow_subdomains: false,
                  disable_additional_identifications: false,
                  sync_user_attributes: false,
                  domain: 'foocorp.com',
                  created_at: 123,
                  updated_at: 123,
                  logo_public_url: null,
                  protocol: 'saml',
                },
                verification: {
                  status: 'verified',
                  strategy: 'saml',
                  verified_at_client: 'foo',
                  attempts: 0,
                  error: {
                    code: 'identifier_already_signed_in',
                    long_message: "You're already signed in",
                    message: "You're already signed in",
                  },
                  expire_at: 123,
                  id: 'ver_123',
                  object: 'verification',
                },
                id: 'eac_123',
              },
            ],
          });
        });

        const { wrapper } = await createFixtures(config);

        const { getByRole, userEvent, getByLabelText } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /update password/i }));
        await waitFor(() => getByRole('heading', { name: /update password/i }));

        expect(getByLabelText(/current password/i)).not.toBeDisabled();
        expect(getByLabelText(/new password/i)).not.toBeDisabled();
        expect(getByLabelText(/confirm password/i)).not.toBeDisabled();
        expect(getByRole('checkbox', { name: /sign out of all other devices/i })).not.toBeDisabled();

        expect(
          screen.queryByText(
            'Your password can currently not be edited because you can sign in only via the enterprise connection.',
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe('Form buttons', () => {
      it('save button is disabled until current password is set', async () => {
        const { wrapper } = await createFixtures(updatePasswordConfig);
        const { getByRole, userEvent, getByLabelText } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /update password/i }));
        await waitFor(() => getByRole('heading', { name: /update password/i }));

        await userEvent.type(getByLabelText(/new password/i), 'testtest');
        await userEvent.type(getByLabelText(/confirm password/i), 'testtest');

        expect(getByRole('button', { name: /save$/i })).toBeDisabled();
      });
    });
  });

  describe('UI errors', () => {
    it('results in error if the password is too small', async () => {
      const { wrapper } = await createFixtures(initConfig);

      await runFakeTimers(async () => {
        const { userEvent, getByRole } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));

        await userEvent.type(screen.getByLabelText(/new password/i), 'test');
        const confirmField = screen.getByLabelText(/confirm password/i);
        await userEvent.type(confirmField, 'test');
        fireEvent.blur(confirmField);
        await waitFor(() => {
          screen.getByText(/or more/i);
        });
      });
    });

    it('results in error if the password is too small', async () => {
      const { wrapper } = await createFixtures(initConfig);

      await runFakeTimers(async () => {
        const { userEvent, getByRole } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));

        await userEvent.type(screen.getByLabelText(/new password/i), 'test');
        const confirmField = screen.getByLabelText(/confirm password/i);
        await userEvent.type(confirmField, 'test');
        fireEvent.blur(confirmField);
        await waitFor(() => {
          screen.getByText(/or more/i);
        });
      });
    });

    it('results in error if the passwords do not match and persists', async () => {
      const { wrapper } = await createFixtures(initConfig);

      await runFakeTimers(async () => {
        const { userEvent, getByRole } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));

        await userEvent.type(screen.getByLabelText(/new password/i), 'testewrewr');
        const confirmField = screen.getByLabelText(/confirm password/i);
        await userEvent.type(confirmField, 'testrwerrwqrwe');
        fireEvent.blur(confirmField);
        await waitFor(() => {
          screen.getByText(`Passwords don't match.`);
        });

        await userEvent.clear(confirmField);
        await waitFor(() => {
          screen.getByText(`Passwords don't match.`);
        });
      });
    }, 10000);

    it(`Displays "Password match" when password match and removes it if they stop`, async () => {
      const { wrapper } = await createFixtures(initConfig);

      await runFakeTimers(async () => {
        const { userEvent, getByRole, getByLabelText, queryByText } = render(<PasswordSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /set password/i }));
        await waitFor(() => getByRole('heading', { name: /set password/i }));
        const passwordField = getByLabelText(/new password/i);

        await userEvent.type(passwordField, 'testewrewr');
        const confirmField = getByLabelText(/confirm password/i);
        await waitFor(() => {
          expect(queryByText(`Passwords match.`)).not.toBeInTheDocument();
        });

        await userEvent.type(confirmField, 'testewrewr');
        await waitFor(() => {
          expect(queryByText(`Passwords match.`)).toBeInTheDocument();
        });

        await userEvent.type(confirmField, 'testrwerrwqrwe');
        await waitFor(() => {
          expect(queryByText(`Passwords match.`)).not.toBeVisible();
        });

        await userEvent.type(passwordField, 'testrwerrwqrwe');
        fireEvent.blur(confirmField);
        await waitFor(() => {
          screen.getByText(`Passwords match.`);
        });
      });
    }, 10000);
  });
});
