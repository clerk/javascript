import { ClerkAPIResponseError } from '@clerk/shared/error';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { fireEvent, mockWebAuthn, render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { OptionsProvider } from '../../../contexts';
import { AppearanceProvider } from '../../../customizables';
import { SignInStart } from '../SignInStart';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInStart', () => {
  const originalGetComputedStyle = window.getComputedStyle;
  const originalLocation = window.location;
  const originalHistory = window.history;
  const mockGetComputedStyle = vi.fn();

  beforeEach(() => {
    // Mock window.getComputedStyle
    mockGetComputedStyle.mockReset();
    mockGetComputedStyle.mockReturnValue({
      animationName: '',
      pointerEvents: 'auto',
      getPropertyValue: vi.fn().mockReturnValue(''),
    });
    Object.defineProperty(window, 'getComputedStyle', {
      value: mockGetComputedStyle,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore patched globals
    Object.defineProperty(window, 'getComputedStyle', {
      value: originalGetComputedStyle,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'history', {
      value: originalHistory,
      writable: true,
      configurable: true,
    });
  });

  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withSupportEmail();
    });
    render(<SignInStart />, { wrapper });
    screen.getAllByText(/sign in to .*/i);
  });

  describe('Login Methods', () => {
    it('enables login with email address', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
      });

      render(<SignInStart />, { wrapper });
      screen.getByText(/email address/i);
    });

    it('enables login with username', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
      });

      render(<SignInStart />, { wrapper });
      screen.getByText(/username/i);
    });

    it('enables login with phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText('Phone number');
    });

    it('enables login with all three (email address, phone number, username)', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUsername();
        f.withEmailAddress();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/email address or username/i);
    });

    it('passkeys shall not interfere with dynamic field when email address and phone number is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withEmailAddress();
        f.withPasskey();
      });
      const { userEvent } = render(<SignInStart />, { wrapper });
      screen.getByText(/email address/i);
      await userEvent.click(screen.getByText(/use phone/i));
      screen.getByText(/phone number/i);
      await userEvent.click(screen.getByText(/use email/i));
      screen.getByText(/email address/i);
    });

    mockWebAuthn(() => {
      it('enables login with passkey via dedicated button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPasskey();
          f.withPasskeySettings({
            allow_autofill: false,
            show_sign_in_button: true,
          });
        });
        render(<SignInStart />, { wrapper });
        screen.getByText('Use passkey instead');
      });

      it('enables login with passkey via autofill', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPasskey();
          f.withPasskeySettings({
            allow_autofill: true,
            show_sign_in_button: false,
          });
        });

        fixtures.signIn.authenticateWithPasskey.mockResolvedValue({
          status: 'complete',
        } as SignInResource);
        render(<SignInStart />, { wrapper });
        expect(screen.queryByText('Use passkey instead')).not.toBeInTheDocument();

        await waitFor(() => {
          expect(fixtures.signIn.authenticateWithPasskey).toHaveBeenCalledWith({
            flow: 'autofill',
          });
        });
      });
    });
  });

  describe('Restricted mode', () => {
    it('"Don\'t have an account?" text should not be presented', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withRestrictedMode();
      });
      render(<SignInStart />, { wrapper });
      expect(screen.queryByText(/Don’t have an account/i)).not.toBeInTheDocument();
    });

    it('"Don\'t have an account?" text should be visible', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      render(<SignInStart />, { wrapper });

      const signUpLink = screen.getByText(/Don’t have an account/i).nextElementSibling;
      expect(signUpLink?.textContent).toBe('Sign up');
      expect(signUpLink?.tagName.toUpperCase()).toBe('A');
      expect(signUpLink?.getAttribute('href')).toMatch(fixtures.environment.displayConfig.signUpUrl);
    });
  });

  describe('Waitlist mode', () => {
    it('shows the waitlist message', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withWaitlistMode();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText('Join waitlist');
    });
  });

  describe('Social OAuth', () => {
    it.each(OAUTH_PROVIDERS)('shows the "Continue with $name" social OAuth button', async ({ provider, name }) => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider });
      });

      render(<SignInStart />, { wrapper });

      const socialOAuth = screen.getByText(`Continue with ${name}`);
      expect(socialOAuth).toBeDefined();
    });

    it('shows the "Join with $name" social OAuth button', async () => {
      const providers = OAUTH_PROVIDERS.filter(({ provider }) => provider !== 'linkedin_oidc');
      const { wrapper: Wrapper } = await createFixtures(f => {
        providers.forEach(({ provider }) => {
          f.withSocialProvider({ provider });
        });
      });

      const wrapperBefore = ({ children }: { children: React.ReactNode }) => (
        <Wrapper>
          <AppearanceProvider
            appearanceKey={'signIn'}
            appearance={{
              options: {
                socialButtonsVariant: 'blockButton',
              },
            }}
          >
            <OptionsProvider
              value={{
                localization: {
                  socialButtonsBlockButtonManyInView: 'Join with {{provider}}',
                },
              }}
            >
              {children}
            </OptionsProvider>
          </AppearanceProvider>
        </Wrapper>
      );

      render(<SignInStart />, { wrapper: wrapperBefore });

      providers.forEach(providerData => {
        screen.getByText(`Join with ${providerData.name}`);
      });
    });

    it('uses the "cl-socialButtonsIconButton__SOCIALOAUTHNAME" classname when rendering the social button icon only', async () => {
      const { wrapper } = await createFixtures(f => {
        OAUTH_PROVIDERS.forEach(({ provider }) => {
          f.withSocialProvider({ provider });
        });
      });

      const { container } = render(<SignInStart />, { wrapper });

      // target the css classname as this is public API
      OAUTH_PROVIDERS.forEach(providerData => {
        const icon = container.getElementsByClassName(`cl-socialButtonsIconButton__${providerData.provider}`);
        expect(icon.length).toEqual(1);
      });
    });
  });

  describe('navigation', () => {
    it('calls create on clicking Continue button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(Promise.resolve({ status: 'needs_first_factor' } as SignInResource));
      const { userEvent } = render(<SignInStart />, { wrapper });
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
    });

    mockWebAuthn(() => {
      it('calls authenticateWithPasskey on clicking Passkey button', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPasskey();
          f.withPasskeySettings({
            show_sign_in_button: true,
          });
        });
        fixtures.signIn.authenticateWithPasskey.mockResolvedValue({
          status: 'complete',
        } as SignInResource);
        const { userEvent } = render(<SignInStart />, { wrapper });
        await userEvent.click(screen.getByText('Use passkey instead'));
        expect(fixtures.signIn.authenticateWithPasskey).toHaveBeenCalledWith({
          flow: 'discoverable',
        });
      });
    });

    it('navigates to /factor-one page when user clicks on Continue button and create needs a first factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(Promise.resolve({ status: 'needs_first_factor' } as SignInResource));
      const { userEvent } = render(<SignInStart />, { wrapper });
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
      expect(fixtures.router.navigate).toHaveBeenCalledWith('factor-one');
    });

    it('navigates to /factor-two page when user clicks on Continue button and create needs a second factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(Promise.resolve({ status: 'needs_second_factor' } as SignInResource));
      const { userEvent } = render(<SignInStart />, { wrapper });
      expect(screen.getByText('Continue')).toBeInTheDocument();
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
      expect(fixtures.router.navigate).toHaveBeenCalledWith('factor-two');
    });
  });

  describe('Enterprise SSO', () => {
    it('initiates a Enterprise SSO flow if enterprise_sso is listed as the only supported first factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(
        Promise.resolve({
          status: 'needs_first_factor',
          supportedFirstFactors: [{ strategy: 'enterprise_sso' }],
        } as unknown as SignInResource),
      );
      const { userEvent } = render(<SignInStart />, { wrapper });
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'enterprise_sso',
        redirectUrl: 'http://localhost:3000/#/sso-callback',
        redirectUrlComplete: '/',
        continueSignIn: true,
      });
    });
  });

  describe('Identifier switching', () => {
    it('shows the email label', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/email address/i);
    });

    it('shows the phone label', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/phone number/i);
    });

    it('prioritizes phone over username', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/phone number/i);
    });

    it('shows the use phone action', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/use phone/i);
    });

    it('shows the use username action', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/use username/i);
    });

    it('shows the username action upon clicking on use phone', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      let button = screen.getByText(/use username/i);
      fireEvent.click(button);

      screen.getByText(/username/i);

      button = screen.getByText(/use phone/i);
      fireEvent.click(button);

      screen.getByText(/use username/i);
    });

    it('shows an input with type="tel" for the phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });

      expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveAttribute('type', 'tel');
    });
  });

  describe('initialValues', () => {
    it('prefills the emailAddress field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withEmailAddress();
      });
      props.setProps({ initialValues: { emailAddress: 'foo@clerk.com' } });

      render(<SignInStart />, { wrapper });
      screen.getByDisplayValue(/foo@clerk.com/i);
    });

    it('prefills the phoneNumber field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withPhoneNumber();
      });
      props.setProps({ initialValues: { phoneNumber: '+306911111111' } });

      render(<SignInStart />, { wrapper });
      screen.getByDisplayValue(/691 1111111/i);
    });

    it('prefills the username field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUsername();
      });

      props.setProps({ initialValues: { username: 'foo' } });
      render(<SignInStart />, { wrapper });
      screen.getByDisplayValue(/foo/i);
    });
  });

  describe('Submitting form via instant password autofill', () => {
    const ERROR_CODES = ['strategy_for_user_invalid', 'form_password_incorrect', 'form_password_pwned'];
    ERROR_CODES.forEach(code => {
      it(`calls sign in with identifier again with only the email if the api respondes with the error ${code}`, async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword({ required: true });
        });

        const errJSON = {
          code,
          long_message: '',
          message: '',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.create.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent, container } = render(<SignInStart />, { wrapper });

        const emailField = screen.getByLabelText(/email address/i);
        await userEvent.type(emailField, 'hello@clerk.com');

        // We can't find the instantPasswordField in the screen so we must query it by id
        const instantPasswordField = container.querySelector('#password-field') as Element;
        expect(instantPasswordField).not.toBeNull();
        fireEvent.change(instantPasswordField, { target: { value: 'some-password' } });

        const form = container.querySelector('form') as Element;
        expect(instantPasswordField).not.toBeNull();
        fireEvent.submit(form);

        await waitFor(() => {
          expect(fixtures.signIn.create).toHaveBeenCalledWith({
            identifier: 'hello@clerk.com',
            password: 'some-password',
            strategy: 'password',
          });

          expect(fixtures.signIn.create).toHaveBeenCalledWith({
            identifier: 'hello@clerk.com',
          });
        });
      });
    });
  });

  describe('ticket flow', () => {
    it('calls the appropriate resource function upon detecting the ticket', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockResolvedValueOnce({} as SignInResource);

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/sign-in?__clerk_ticket=test_ticket' },
      });
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { replaceState: vi.fn() },
      });

      render(
        <CardStateProvider>
          <SignInStart />
        </CardStateProvider>,
        { wrapper },
      );
      await waitFor(() =>
        expect(fixtures.signIn.create).toHaveBeenCalledWith({ strategy: 'ticket', ticket: 'test_ticket' }),
      );

      // don't remove the ticket quite yet
      expect(window.history.replaceState).not.toHaveBeenCalledWith(
        undefined,
        '',
        expect.not.stringContaining('__clerk_ticket'),
      );
    });

    it('removes the query param upon completion', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.status = 'complete';
      fixtures.signIn.create.mockResolvedValueOnce(fixtures.signIn as SignInResource);

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/sign-in?__clerk_ticket=test_ticket' },
      });
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { replaceState: vi.fn() },
      });

      render(
        <CardStateProvider>
          <SignInStart />
        </CardStateProvider>,
        { wrapper },
      );
      await waitFor(() =>
        expect(fixtures.signIn.create).toHaveBeenCalledWith({ strategy: 'ticket', ticket: 'test_ticket' }),
      );

      expect(window.history.replaceState).toHaveBeenCalledWith(
        undefined,
        '',
        expect.not.stringContaining('__clerk_ticket'),
      );
    });
  });
});
