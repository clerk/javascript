import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement, useState } from 'react';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi, VERIFICATION_CODE } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  type FapiEnvironmentOverrides,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiSignUp,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp } from '../sign-up';
import {
  codeSent,
  continueButton,
  EMAIL,
  emailField,
  enterCode,
  environment,
  minimumPasswordLength,
  OTHER_EMAIL,
  PASSWORD,
  passwordField,
  renderSignUp,
  renderSignUpWithRouteProbe,
  RouteProbe,
  SHORT_PASSWORD,
  signedInSession,
  submitStart,
  visitWithQuery,
  watchFor,
  watchForHeading,
} from './sign-up.fixtures';

function captureNavigations() {
  const navigation = (window as unknown as { navigation: EventTarget }).navigation;
  const urls: string[] = [];
  const onNavigate = (event: Event) => {
    urls.push((event as Event & { destination: { url: string } }).destination.url);
    event.preventDefault();
  };
  navigation.addEventListener('navigate', onNavigate);
  onTestFinished(() => navigation.removeEventListener('navigate', onNavigate));
  return urls;
}

describe('SignUp', () => {
  describe('signing up with an email and password', () => {
    it('creates the sign-up, verifies the email and leaves for the after sign-up URL', async () => {
      const { fapi, user, navigate, clerk } = await renderSignUp({}, {}, { signUpFallbackRedirectUrl: '/welcome' });

      await submitStart(user);

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(screen.getByText(EMAIL)).toBeInTheDocument();
      await waitFor(() => expect(fapi.signUp.preparations).toEqual(['email_code']));

      await enterCode(user);

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/welcome')));
      expect(fapi.client.sessions).toHaveLength(1);
      expect(clerk.session?.id).toBe(fapi.client.sessions[0].id);
      expect(fapi.signUp.preparations).toEqual(['email_code']);
    });

    it('shows only required fields until optional fields are asked for', async () => {
      const view = await renderSignUp();

      expect(await screen.findByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
      expect(screen.queryByRole('textbox', { name: 'Username' })).toBeNull();

      view.rerender(<SignUp showOptionalFields />);

      expect(await screen.findByRole('textbox', { name: 'First name' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Username' })).toBeInTheDocument();
    });

    it('sends a prefilled value for an optional field it does not show', async () => {
      const { fapi, user } = await renderSignUp({}, { initialValues: { firstName: 'Alice' } });

      await submitStart(user);
      await codeSent();

      expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
      expect(fapi.signUp.creations[0].get('first_name')).toBe('Alice');
    });

    it('prefills the form and sends the metadata and a trimmed username', async () => {
      const { fapi, user } = await renderSignUp(
        { environment: environment({ attributes: { username: { required: true } } }) },
        { initialValues: { emailAddress: EMAIL }, unsafeMetadata: { plan: 'pro' } },
      );

      expect(await screen.findByRole('textbox', { name: 'Email address' })).toHaveValue(EMAIL);
      await user.type(screen.getByRole('textbox', { name: 'Username' }), '  alice  ');
      await user.type(passwordField(), PASSWORD);
      await user.click(continueButton());

      await codeSent();
      const [body] = fapi.signUp.creations;
      expect(body.get('email_address')).toBe(EMAIL);
      expect(body.get('username')).toBe('alice');
      expect(body.get('unsafe_metadata')).toBe(JSON.stringify({ plan: 'pro' }));
    });

    it('locks the form while the sign-up is being created', async () => {
      const { user } = await renderSignUp();
      const hold = holdRequests('post', '/v1/client/sign_ups');

      await submitStart(user);

      await waitFor(() => expect(emailField()).toHaveAttribute('aria-disabled', 'true'));
      expect(passwordField()).toHaveAttribute('aria-disabled', 'true');

      hold.release();

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      await codeSent();
    });

    it('shows a rejected email address on its field and stays on the form', async () => {
      const { fapi, user } = await renderSignUp({ signUp: { takenEmailAddresses: [EMAIL] } });

      await submitStart(user);

      expect(await screen.findByText('That email address is taken. Please try another.')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      expect(fapi.signUp.preparations).toEqual([]);
    });

    it('checks the password while it is typed', async () => {
      const { user } = await renderSignUp();

      await user.type(await screen.findByLabelText('Password', { selector: 'input' }), 'abc');

      expect(await screen.findByText('Your password must contain 8 or more characters.')).toBeInTheDocument();
    });

    it.each([
      {
        screen: 'the start form',
        open: async () => {
          const view = await renderSignUp({ environment: minimumPasswordLength(12) });
          await view.user.type(await screen.findByRole('textbox', { name: 'Email address' }), EMAIL);
          return { user: view.user, sent: view.fapi.signUp.creations };
        },
      },
      {
        screen: 'the continue screen',
        open: async () => {
          const view = await renderSignUpWithRouteProbe({
            environment: minimumPasswordLength(12),
            client: { ...fapiClient(), sign_up: fapiSignUp({ email_address: EMAIL }) },
          });
          await view.user.click(screen.getByRole('button', { name: 'Open the verify route' }));
          await enterCode(view.user);
          expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
          return { user: view.user, sent: view.fapi.signUp.updates };
        },
      },
    ])('names the instance minimum when FAPI rejects a password as too short on $screen', async ({ open }) => {
      const { user, sent } = await open();

      await user.type(passwordField(), SHORT_PASSWORD);
      await user.click(continueButton());

      await waitFor(() => expect(passwordField()).toBeInvalid());
      expect(passwordField()).toHaveAccessibleDescription('Your password must contain 12 or more characters.');
      expect(sent).toHaveLength(1);
    });

    it('shows a taken email address beside the password FAPI rejected with it', async () => {
      const { user } = await renderSignUp({
        environment: minimumPasswordLength(12),
        signUp: { takenEmailAddresses: [EMAIL] },
      });

      await user.type(await screen.findByRole('textbox', { name: 'Email address' }), EMAIL);
      await user.type(passwordField(), SHORT_PASSWORD);
      await user.click(continueButton());

      await waitFor(() => expect(passwordField()).toBeInvalid());
      expect(passwordField()).toHaveAccessibleDescription('Your password must contain 12 or more characters.');
      expect(emailField()).toHaveAccessibleDescription('That email address is taken. Please try another.');
    });

    it('shows what FAPI suggests when it rejects a password as too weak', async () => {
      const { user } = await renderSignUp({ signUp: { weakPasswords: { [PASSWORD]: ['anotherWord'] } } });

      await submitStart(user);

      await waitFor(() => expect(passwordField()).toBeInvalid());
      expect(passwordField()).toHaveAccessibleDescription(
        'Your password is not strong enough. Add more words that are less common.',
      );
    });

    it('asks for legal consent and sends it', async () => {
      const { fapi, user } = await renderSignUp({
        environment: environment({
          user_settings: {
            sign_up: {
              allowlist_only: false,
              progressive: true,
              captcha_enabled: false,
              mode: 'public',
              legal_consent_enabled: true,
            },
          },
        }),
      });

      await user.type(await screen.findByRole('textbox', { name: 'Email address' }), EMAIL);
      await user.type(passwordField(), PASSWORD);
      await user.click(screen.getByRole('checkbox'));
      await user.click(continueButton());

      await waitFor(() => expect(fapi.signUp.creations).toHaveLength(1));
      expect(fapi.signUp.creations[0].get('legal_accepted')).toBe('true');
      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      await codeSent();
    });

    it('names each empty required field when Continue is pressed, and creates nothing until they are filled', async () => {
      const { fapi, user } = await renderSignUp({
        environment: environment({
          attributes: { first_name: { enabled: true, required: true }, username: { required: true } },
        }),
      });

      await submitStart(user);

      const firstName = screen.getByRole('textbox', { name: 'First name' });
      expect(await screen.findByText('First name is required.')).toBeInTheDocument();
      expect(screen.getByText('Username is required.')).toBeInTheDocument();
      expect(firstName).toHaveFocus();
      expect(fapi.signUp.creations).toHaveLength(0);

      await user.type(firstName, 'Alice');
      await user.type(screen.getByRole('textbox', { name: 'Username' }), 'alice');
      await user.click(continueButton());

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(fapi.signUp.creations[0].get('username')).toBe('alice');
      await codeSent();
    });

    it('flags an empty required field only once Continue is pressed', async () => {
      const { user } = await renderSignUp();

      await user.click(await screen.findByRole('textbox', { name: 'Email address' }));
      await user.tab();

      expect(screen.queryByText('Email address is required.')).not.toBeInTheDocument();

      await user.click(continueButton());

      expect(await screen.findByText('Email address is required.')).toBeInTheDocument();
    });

    it('asks for legal consent when Continue is pressed without it', async () => {
      const { fapi, user } = await renderSignUp({
        environment: environment({
          user_settings: {
            sign_up: {
              allowlist_only: false,
              progressive: true,
              captcha_enabled: false,
              mode: 'public',
              legal_consent_enabled: true,
            },
          },
        }),
      });

      await user.type(await screen.findByRole('textbox', { name: 'Email address' }), EMAIL);
      await user.type(passwordField(), PASSWORD);
      await user.click(continueButton());

      expect(await screen.findByText('Accept the terms to continue.')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toHaveFocus();
      expect(fapi.signUp.creations).toHaveLength(0);
    });

    it('shows a try-again message when sign-ups are rate limited', async () => {
      const { user } = await renderSignUp();
      const hold = holdRequests('post', '/v1/client/sign_ups');

      await submitStart(user);
      await waitFor(() => expect(hold.requests).toHaveLength(1));
      hold.fail('signup_rate_limit_exceeded', 'Sign-up rate limit exceeded for this instance.');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Too many requests. Please try again in a bit.'),
      );
    });

    it('replaces the form with the blocked notice when the request is blocked', async () => {
      const { user } = await renderSignUp({
        signUp: { blocked: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' } },
      });

      await submitStart(user);

      expect(await screen.findByRole('heading', { name: 'Request blocked' })).toBeInTheDocument();
      expect(screen.getByText('Contact support.')).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();
    });

    it('shows the form again when it is mounted after a blocked request', async () => {
      const { user, rerender } = await renderSignUp({
        signUp: { blocked: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' } },
      });

      await submitStart(user);
      await screen.findByRole('heading', { name: 'Request blocked' });

      rerender(<SignUp key='mounted again' />);

      expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Request blocked' })).toBeNull();
    });
  });

  describe('verifying the email', () => {
    it('keeps Edit disabled until the first code is sent', async () => {
      const { fapi, user } = await renderSignUp();
      const hold = holdRequests('post', '/v1/client/sign_ups/:id/prepare_verification');

      await submitStart(user);
      await waitFor(() => expect(hold.requests).toHaveLength(1));

      expect(await screen.findByRole('button', { name: 'Edit email address' })).toBeDisabled();

      hold.release();
      expect(await codeSent()).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Edit email address' })).toBeEnabled();
      expect(fapi.signUp.preparations).toEqual(['email_code']);
    });

    it('shows why the code could not be sent and keeps the code screen', async () => {
      const { user } = await renderSignUp();
      const hold = holdRequests('post', '/v1/client/sign_ups/:id/prepare_verification');

      await submitStart(user);
      await waitFor(() => expect(hold.requests).toHaveLength(1));
      hold.fail('form_param_invalid', 'The email code could not be sent.');

      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('The email code could not be sent.'));
      expect(screen.getByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    });

    it('shows a wrong code on the code field and accepts the right one after', async () => {
      const { fapi, user, navigate } = await renderSignUp();

      await submitStart(user);
      await enterCode(user, '111111');

      expect(await screen.findByText('Incorrect code')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(fapi.client.sessions).toHaveLength(0);

      await user.clear(screen.getByRole('textbox', { name: 'Verification code' }));
      await enterCode(user);

      await waitFor(() => expect(navigate).toHaveBeenCalled());
      expect(fapi.client.sessions).toHaveLength(1);
    });

    it('returns to the form with the address and password kept when the user edits it', async () => {
      const { user } = await renderSignUp();

      await submitStart(user);
      await codeSent();
      await user.click(screen.getByRole('button', { name: 'Edit email address' }));

      expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      expect(emailField()).toHaveValue(EMAIL);
      expect(passwordField()).toHaveValue(PASSWORD);
    });
  });

  describe('filling in missing fields', () => {
    it('verifies the email before asking for a missing field, then completes from the continue screen', async () => {
      const { fapi, user, navigate } = await renderSignUpWithRouteProbe({
        environment: environment({ attributes: { username: { required: true } } }),
        client: { ...fapiClient(), sign_up: fapiSignUp({ email_address: EMAIL, has_password: true }) },
      });

      await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
      await enterCode(user);

      expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();
      expect(screen.queryByLabelText('Password', { selector: 'input' })).toBeNull();

      await user.type(screen.getByRole('textbox', { name: 'Username' }), 'alice');
      await user.click(continueButton());

      await waitFor(() => expect(navigate).toHaveBeenCalled());
      expect(fapi.signUp.updates).toHaveLength(1);
      expect(fapi.signUp.updates[0].get('username')).toBe('alice');
      expect(fapi.client.sessions).toHaveLength(1);
    });

    it('sends the password from the continue screen when the sign-up has none', async () => {
      const { fapi, user, navigate } = await renderSignUpWithRouteProbe({
        client: { ...fapiClient(), sign_up: fapiSignUp({ email_address: EMAIL }) },
      });

      await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
      await enterCode(user);

      expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
      await user.type(passwordField(), PASSWORD);
      await user.click(continueButton());

      await waitFor(() => expect(navigate).toHaveBeenCalled());
      expect(fapi.signUp.updates).toHaveLength(1);
      expect(fapi.signUp.updates[0].get('password')).toBe(PASSWORD);
      expect(fapi.client.sessions).toHaveLength(1);
    });

    it('asks for an email or a phone number on the continue screen when the sign-up has no identifier', async () => {
      const { fapi, user } = await renderSignUpWithRouteProbe({
        environment: environment({
          attributes: { email_address: { required: false }, phone_number: { enabled: true, required: false } },
        }),
        client: { ...fapiClient(), sign_up: fapiSignUp({ has_password: true }) },
      });

      await user.click(screen.getByRole('button', { name: 'Open the continue route' }));

      expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Username' })).toBeNull();
      await user.click(screen.getByRole('button', { name: 'Use phone instead' }));
      expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();
      await user.click(screen.getByRole('button', { name: 'Use email instead' }));
      await user.type(emailField(), EMAIL);
      await user.click(continueButton());

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(fapi.signUp.updates[0].get('email_address')).toBe(EMAIL);
      expect(fapi.signUp.updates[0].get('username')).toBeNull();
      await codeSent();
    });

    it('keeps the unverified email address on the continue screen so the user can change it', async () => {
      const { fapi, user } = await renderSignUpWithRouteProbe({
        environment: environment({
          attributes: { email_address: { required: false }, phone_number: { enabled: true, required: false } },
        }),
        client: { ...fapiClient(), sign_up: fapiSignUp({ has_password: true }) },
      });

      await user.click(screen.getByRole('button', { name: 'Open the continue route' }));
      await user.type(await screen.findByRole('textbox', { name: 'Email address' }), EMAIL);
      await user.click(continueButton());
      await codeSent();
      await user.click(screen.getByRole('button', { name: 'Edit email address' }));

      expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
      expect(emailField()).toHaveValue(EMAIL);
      expect(screen.queryByRole('button', { name: 'Use phone instead' })).toBeNull();

      await user.clear(emailField());
      await user.type(emailField(), OTHER_EMAIL);
      await user.click(continueButton());

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(screen.getByText(OTHER_EMAIL)).toBeInTheDocument();
      await waitFor(() => expect(fapi.signUp.preparations).toEqual(['email_code', 'email_code']));
      expect(fapi.signUp.updates[1].get('email_address')).toBe(OTHER_EMAIL);
    });

    it('sends a new code when the user continues from Edit without changing the address', async () => {
      const { fapi, user } = await renderSignUpWithRouteProbe({
        environment: environment({
          attributes: { email_address: { required: false }, phone_number: { enabled: true, required: false } },
        }),
        client: { ...fapiClient(), sign_up: fapiSignUp({ has_password: true }) },
      });

      await user.click(screen.getByRole('button', { name: 'Open the continue route' }));
      await user.type(await screen.findByRole('textbox', { name: 'Email address' }), EMAIL);
      await user.click(continueButton());
      await codeSent();
      await user.click(screen.getByRole('button', { name: 'Edit email address' }));
      await screen.findByRole('heading', { name: 'Fill in missing fields' });
      await user.click(continueButton());

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      await waitFor(() => expect(fapi.signUp.preparations).toEqual(['email_code', 'email_code']));
    });

    it('asks for an email or a phone number on the continue screen of an instance without progressive sign-up', async () => {
      const { fapi, user } = await renderSignUpWithRouteProbe({
        environment: environment({
          attributes: {
            phone_number: {
              enabled: true,
              used_for_first_factor: true,
              first_factors: ['phone_code'],
              verifications: ['phone_code'],
            },
          },
          user_settings: {
            sign_up: {
              allowlist_only: false,
              progressive: false,
              captcha_enabled: false,
              mode: 'public',
              legal_consent_enabled: false,
            },
          },
        }),
        client: { ...fapiClient(), sign_up: fapiSignUp({ has_password: true }) },
      });

      await user.click(screen.getByRole('button', { name: 'Open the continue route' }));

      expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Use phone instead' })).toBeInTheDocument();
      await user.type(emailField(), EMAIL);
      await user.click(continueButton());

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(fapi.signUp.updates[0].get('email_address')).toBe(EMAIL);
      expect(fapi.signUp.updates[0].get('phone_number')).toBeNull();
      await codeSent();
    });

    it('asks for legal consent on the continue screen when the sign-up has not accepted it', async () => {
      const { fapi, user, navigate } = await renderSignUpWithRouteProbe({
        environment: environment({
          user_settings: {
            sign_up: {
              allowlist_only: false,
              progressive: true,
              captcha_enabled: false,
              mode: 'public',
              legal_consent_enabled: true,
            },
          },
        }),
        client: { ...fapiClient(), sign_up: fapiSignUp({ email_address: EMAIL, has_password: true }) },
      });

      await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
      await enterCode(user);

      expect(await screen.findByRole('heading', { name: 'Legal consent' })).toBeInTheDocument();
      await user.click(screen.getByRole('checkbox'));
      await user.click(continueButton());

      await waitFor(() => expect(navigate).toHaveBeenCalled());
      expect(fapi.signUp.updates[0].get('legal_accepted')).toBe('true');
    });

    it('asks only for the provider the sign-up still needs on the continue screen', async () => {
      const provider = { enabled: true, authenticatable: true, logo_url: null };
      const { clerk, fapi, user } = await renderSignUp({
        environment: environment({
          user_settings: {
            social: {
              oauth_google: { ...provider, required: true, strategy: 'oauth_google', name: 'Google' },
              oauth_github: { ...provider, required: false, strategy: 'oauth_github', name: 'GitHub' },
            },
          },
        }),
      });
      const leave = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});

      await submitStart(user);
      await enterCode(user);

      expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /GitHub/ })).toBeNull();

      await user.click(screen.getByRole('button', { name: /Google/ }));

      await waitFor(() => expect(leave).toHaveBeenCalled());
      expect(fapi.signUp.creations).toHaveLength(1);
      expect(fapi.signUp.updates.at(-1)?.get('strategy')).toBe('oauth_google');
    });
  });

  describe('starting over', () => {
    it('offers Start over when the sign-up needs a provider that cannot sign the user in', async () => {
      const { user } = await renderSignUp({
        environment: environment({
          user_settings: {
            social: {
              oauth_google: {
                enabled: true,
                required: true,
                authenticatable: false,
                strategy: 'oauth_google',
                name: 'Google',
                logo_url: null,
              },
            },
          },
        }),
      });

      await submitStart(user);
      await enterCode(user);

      expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Fill in missing fields' })).toBeNull();
    });

    it('offers Start over on an instance that verifies email by link', async () => {
      const { fapi, user } = await renderSignUp({
        environment: environment({ attributes: { email_address: { required: true, verifications: ['email_link'] } } }),
      });

      await submitStart(user);

      expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        'We couldn’t continue signing you up. Start over to try again.',
      );
      expect(fapi.signUp.preparations).toEqual([]);

      await user.click(screen.getByRole('button', { name: 'Start over' }));

      expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      expect(emailField()).toHaveValue('');
    });

    it('offers Start over when the email belongs to an enterprise connection', async () => {
      const { fapi, user } = await renderSignUp({ signUp: { enterpriseDomains: ['example.com'] } });

      await submitStart(user);

      expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        'We couldn’t continue signing you up. Start over to try again.',
      );
      expect(fapi.signUp.preparations).toEqual([]);

      await user.click(screen.getByRole('button', { name: 'Start over' }));

      expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    });
  });

  describe('finishing', () => {
    const ACTIVATION_ERROR = 'The session could not be activated.';
    const ACTIVATION = '/v1/client/sessions/:id/touch';

    async function failActivation(user: ReturnType<typeof userEvent.setup>) {
      const hold = holdRequests('post', ACTIVATION);
      await submitStart(user);
      await enterCode(user);
      await waitFor(() => expect(hold.requests).toHaveLength(1));
      hold.fail('form_param_invalid', ACTIVATION_ERROR);
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(ACTIVATION_ERROR));
    }

    it('keeps the code screen and shows why when the new session cannot be activated', async () => {
      const { user, navigate } = await renderSignUp();

      await failActivation(user);

      expect(screen.getByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('activates the session when the user enters the code again after the activation failed', async () => {
      const { user, navigate } = await renderSignUp({}, {}, { signUpFallbackRedirectUrl: '/welcome' });
      await failActivation(user);
      const retry = holdRequests('post', ACTIVATION);

      const code = screen.getByRole('textbox', { name: 'Verification code' });
      await user.clear(code);
      await user.click(code);
      await user.keyboard(VERIFICATION_CODE);
      await waitFor(() => expect(retry.requests).toHaveLength(1));
      retry.release();

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/welcome')));
    });

    it('drops the activation error when the user goes back to edit the address', async () => {
      const { user } = await renderSignUp();
      await failActivation(user);

      await user.click(screen.getByRole('button', { name: 'Edit email address' }));

      expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      await waitFor(() => expect(screen.queryAllByText(ACTIVATION_ERROR)).toHaveLength(0));
    });

    it.each([
      { mode: 'multi-session', seed: {} },
      { mode: 'single-session', seed: { environment: environment({ auth_config: { single_session_mode: true } }) } },
    ])('leaves once, then shows nothing and is not busy while it stays mounted in $mode mode', async ({ seed }) => {
      const { user, navigate, container, rerender } = await renderSignUp(
        seed,
        {},
        { signUpFallbackRedirectUrl: '/welcome' },
      );

      await submitStart(user);
      await enterCode(user);

      await waitFor(() => expect(container).toBeEmptyDOMElement());
      rerender(<SignUp />);

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith('/welcome');
      expect(screen.queryByRole('heading', { name: 'Create your account' })).toBeNull();
      expect(screen.queryByRole('button', { busy: true })).toBeNull();
    });
  });

  describe('continuing to a session task', () => {
    it('shows the organization task in the same card when the new session has one', async () => {
      const { user, navigate } = await renderSignUp({ signUp: { sessionTasks: [{ key: 'choose-organization' }] } });

      await submitStart(user);
      await codeSent();
      await waitFor(() => expect(screen.queryByRole('heading', { name: 'Create your account' })).toBeNull());
      const sawStart = watchForHeading('Create your account');
      const sawSkeleton = watchFor(() => screen.queryByText('Loading organizations…') !== null);
      await enterCode(user);

      expect(await screen.findByRole('heading', { name: 'Create organization' })).toBeInTheDocument();
      expect(sawStart()).toBe(false);
      expect(sawSkeleton()).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('leaves once an organization is chosen, without showing the create screen or another screen', async () => {
      const acme = fapiOrganization({ id: 'org_1', name: 'Acme', slug: 'acme' });
      const { user, navigate, container } = await renderSignUp(
        { signUp: { sessionTasks: [{ key: 'choose-organization' }] }, memberships: [fapiMembership(acme)] },
        {},
        { signUpFallbackRedirectUrl: '/welcome' },
      );

      await submitStart(user);
      await codeSent();
      const sawEmptyList = watchForHeading('Create organization');
      await enterCode(user);
      const sawAnotherScreen = watchForHeading(/Create your account|Something went wrong/);
      await user.click(await screen.findByRole('button', { name: 'Acme' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/welcome')));
      await waitFor(() => expect(container).toBeEmptyDOMElement());
      expect(sawEmptyList()).toBe(false);
      expect(sawAnotherScreen()).toBe(false);
    });

    it('goes to the task URL the application set', async () => {
      const { user, navigate } = await renderSignUp(
        { signUp: { sessionTasks: [{ key: 'choose-organization' }] } },
        {},
        { taskUrls: { 'choose-organization': '/onboarding/organization' } },
      );

      await submitStart(user);
      await enterCode(user);

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/onboarding/organization')));
      expect(screen.queryByRole('heading', { name: 'Create organization' })).toBeNull();
    });

    it('leaves for the sign-in task route for a task it does not show', async () => {
      const { user, navigate } = await renderSignUp({ signUp: { sessionTasks: [{ key: 'setup-mfa' }] } });

      await submitStart(user);
      await enterCode(user);

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('tasks/setup-mfa')));
    });
  });

  describe('arriving signed in', () => {
    it('leaves for the after sign-up URL without showing the form when a user is signed in, in single-session mode', async () => {
      const sawForm = watchForHeading('Create your account');
      const { navigate, rerender } = await renderSignUp(
        {
          environment: environment({ auth_config: { single_session_mode: true } }),
          client: fapiClient([signedInSession]),
        },
        {},
        { signUpFallbackRedirectUrl: '/welcome' },
      );

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome'));
      rerender(<SignUp />);

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(sawForm()).toBe(false);
    });

    it('leaves without resuming an unfinished sign-up when a user is signed in, in single-session mode', async () => {
      const sawForm = watchForHeading('Create your account');
      const { navigate } = await renderSignUp(
        {
          environment: environment({ auth_config: { single_session_mode: true } }),
          client: {
            ...fapiClient([signedInSession]),
            sign_up: fapiSignUp({ email_address: EMAIL, has_password: true }),
          },
        },
        {},
        { signUpFallbackRedirectUrl: '/welcome' },
      );

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome'));

      expect(sawForm()).toBe(false);
    });

    it('shows the form to add another account when a user is signed in, in multi-session mode', async () => {
      const { navigate } = await renderSignUp({ client: fapiClient([signedInSession]) });

      expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      expect(continueButton()).not.toHaveAttribute('aria-busy', 'true');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('leaves once and shows nothing after a visitor who arrived with the organization task pending picks one', async () => {
      const acme = fapiOrganization({ id: 'org_1', name: 'Acme', slug: 'acme' });
      const pendingSession = fapiSession({
        id: 'sess_pending',
        user: fapiUser({ id: 'user_existing' }),
        status: 'pending',
        tasks: [{ key: 'choose-organization' }],
      });
      const { user, navigate, container } = await renderSignUp(
        { client: fapiClient([pendingSession]), memberships: [fapiMembership(acme)] },
        {},
        { signUpFallbackRedirectUrl: '/welcome' },
      );

      await user.click(await screen.findByRole('button', { name: 'Acme' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/welcome')));
      await waitFor(() => expect(container).toBeEmptyDOMElement());
      expect(navigate.mock.calls).toEqual([[expect.stringContaining('/welcome')]]);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('opening a route directly', () => {
    it('shows the start form when a verify route is opened before the sign-up exists', async () => {
      const { user } = await renderSignUpWithRouteProbe();

      await user.click(screen.getByRole('button', { name: 'Open the verify route' }));

      expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      expect(emailField()).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Verify your email' })).toBeNull();
    });

    it('shows the code screen and sends no second code when a verify route is reopened while the first sends', async () => {
      const { fapi, user } = await renderSignUpWithRouteProbe();
      const hold = holdRequests('post', '/v1/client/sign_ups/:id/prepare_verification');

      await submitStart(user);
      await waitFor(() => expect(hold.requests).toHaveLength(1));
      await user.click(screen.getByRole('button', { name: 'Open the start route' }));
      await screen.findByRole('heading', { name: 'Create your account' });

      await user.click(screen.getByRole('button', { name: 'Open the verify route' }));

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      hold.release();
      await codeSent();
      expect(fapi.signUp.preparations).toEqual(['email_code']);
    });

    it('sends no second code and keeps Resend locked when a verify route is reopened with a code out', async () => {
      const { fapi, user, navigate } = await renderSignUpWithRouteProbe();

      await submitStart(user);
      await codeSent();
      await user.click(screen.getByRole('button', { name: 'Edit email address' }));
      await screen.findByRole('heading', { name: 'Create your account' });

      await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
      expect(await codeSent()).toBeDisabled();
      await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
      await user.keyboard(VERIFICATION_CODE);

      await waitFor(() => expect(navigate).toHaveBeenCalled());
      expect(fapi.signUp.preparations).toEqual(['email_code']);
    });
  });

  describe('keeping the redirect URL', () => {
    it('leaves for the redirect_url in the query after sign-up', async () => {
      visitWithQuery('?redirect_url=%2Fdashboard');
      const { user, navigate } = await renderSignUp({}, {}, { signUpFallbackRedirectUrl: '/welcome' });

      await submitStart(user);
      await enterCode(user);

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
      expect(navigate).not.toHaveBeenCalledWith(expect.stringContaining('/welcome'));
    });

    it('keeps the redirect_url from the query on the sign-in link', async () => {
      visitWithQuery('?redirect_url=%2Fdashboard');
      const { user, navigate } = await renderSignUp();

      await user.click(await screen.findByRole('button', { name: 'Sign in' }));

      const [to] = navigate.mock.lastCall ?? [''];
      expect(to).toContain('/sign-in');
      expect(decodeURIComponent(to)).toContain(`redirect_url=${window.location.origin}/dashboard`);
    });
  });

  describe('when sign-ups are closed', () => {
    it('shows the restricted notice and emails support from it in restricted mode', async () => {
      await renderSignUp({
        environment: environment({
          display_config: { support_email: 'help@acme.test' },
          user_settings: {
            sign_up: {
              allowlist_only: false,
              progressive: true,
              captcha_enabled: false,
              mode: 'restricted',
              legal_consent_enabled: false,
            },
          },
        }),
      });
      const navigations = captureNavigations();
      const user = userEvent.setup();

      expect(await screen.findByRole('heading', { name: 'Access restricted' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Email support' }));

      await waitFor(() => expect(navigations).toEqual(['mailto:help@acme.test']));
    });

    it('shows the waitlist notice in waitlist mode and goes to the waitlist with the redirect_url kept', async () => {
      visitWithQuery('?redirect_url=%2Fdashboard');
      const { user, navigate } = await renderSignUp(
        {
          environment: environment({
            user_settings: {
              sign_up: {
                allowlist_only: false,
                progressive: true,
                captcha_enabled: false,
                mode: 'waitlist',
                legal_consent_enabled: false,
              },
            },
          }),
        },
        {},
        { waitlistUrl: '/waitlist' },
      );

      expect(await screen.findByRole('heading', { name: 'Access restricted' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Join waitlist' }));

      const [to] = navigate.mock.lastCall ?? [''];
      expect(to).toContain('/waitlist');
      expect(decodeURIComponent(to)).toContain('redirect_url=/dashboard');
    });
  });

  describe('seeing the Clerk signature', () => {
    it('signs the card when the instance is branded and carries no signature when the branding is paid off', async () => {
      const branded = await renderSignUp({ environment: environment({ display_config: { branded: true } }) });

      await screen.findByRole('heading', { name: 'Create your account' });
      expect(screen.getByText(/Secured by/)).toBeInTheDocument();
      branded.unmount();

      await renderSignUp({ environment: environment({ display_config: { branded: false } }) });

      await screen.findByRole('heading', { name: 'Create your account' });
      expect(screen.queryByText(/Secured by/)).toBeNull();
    });
  });
});

describe('SignUp social sign-up', () => {
  const GOOGLE = {
    enabled: true,
    required: false,
    authenticatable: true,
    strategy: 'oauth_google' as const,
    name: 'Google',
    logo_url: null,
  };

  afterEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
  });

  function socialEnvironment(overrides: FapiEnvironmentOverrides = {}) {
    return environment({
      ...overrides,
      user_settings: { social: { oauth_google: GOOGLE }, ...overrides.user_settings },
    });
  }

  async function startWithGoogle(
    seed: FakeFapiSeed,
    options?: Parameters<typeof renderWithClerk>[1],
    provider: RegExp = /Google/,
  ) {
    const fapi = serveFapi({ environment: socialEnvironment(), ...seed });
    const first = await renderWithClerk(<SignUp />, options);
    const leave = vi.spyOn(first.clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: provider }));
    await waitFor(() => expect(leave).toHaveBeenCalled());
    return { fapi, first, leave, user };
  }

  async function returnFromGoogle(
    fapi: ReturnType<typeof serveFapi>,
    first: Awaited<ReturnType<typeof renderWithClerk>>,
    options?: Parameters<typeof renderWithClerk>[1],
    ui: ReactElement = <SignUp />,
  ) {
    const started = [...fapi.signUp.creations, ...fapi.signUp.updates].filter(body => body.has('redirect_url'));
    const callback = new URL(started.at(-1)?.get('redirect_url') ?? '');
    first.unmount();
    fapi.signUp.returnFromOAuth();
    window.history.replaceState(null, '', `${callback.pathname}${callback.search}`);
    return renderWithClerk(ui, options);
  }

  it('starts Google sign-up with a callback URL that brings the user back to sign-up', async () => {
    const { fapi, leave } = await startWithGoogle({});

    expect(String(leave.mock.calls[0][0])).toBe('https://oauth.example/authorize?strategy=oauth_google');
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(fapi.signUp.creations[0].get('strategy')).toBe('oauth_google');
    expect(fapi.signUp.creations[0].get('redirect_url')).toContain('__clerk_mosaic_sign_up=sso-callback');
    expect(fapi.signUp.creations[0].get('action_complete_redirect_url')).toBeTruthy();
  });

  it('sends the redirect_url from the query as the URL to land on after Google', async () => {
    window.history.replaceState(null, '', `${window.location.pathname}?redirect_url=%2Fdashboard`);

    const { fapi } = await startWithGoogle({});

    const afterGoogle = new URL(fapi.signUp.creations[0].get('action_complete_redirect_url') ?? '');
    expect(afterGoogle.pathname).toBe('/dashboard');
  });

  it('asks for what Google did not provide after the return, then completes', async () => {
    const seed: FakeFapiSeed = {
      environment: socialEnvironment({ attributes: { username: { enabled: true, required: true } } }),
      signUp: { oauth: { oauth_google: { emailAddress: EMAIL } } },
    };
    const { fapi, first } = await startWithGoogle(seed);

    const { navigate } = await returnFromGoogle(fapi, first);

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
    expect(screen.queryByRole('button', { name: /Google/ })).toBeNull();
    expect(screen.queryByLabelText('Password')).toBeNull();

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'Username' }), 'alice');
    await user.click(continueButton());

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.signUp.updates.at(-1)?.get('username')).toBe('alice');
    expect(fapi.client.sessions).toHaveLength(1);
  });

  it('completes the return when sign-up opens on the continue route', async () => {
    function OpenOnContinue() {
      const write = useVirtualWrite();
      const [opened, setOpened] = useState(false);
      return opened ? (
        <SignUp />
      ) : (
        <button
          type='button'
          onClick={() => {
            write('/sign-up', ['continue']);
            setOpened(true);
          }}
        >
          Open sign-up on continue
        </button>
      );
    }
    const { fapi, first } = await startWithGoogle({
      environment: socialEnvironment({ attributes: { username: { enabled: true, required: true } } }),
      signUp: { oauth: { oauth_google: { emailAddress: EMAIL } } },
    });

    await returnFromGoogle(fapi, first, undefined, <OpenOnContinue />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open sign-up on continue' }));

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
  });

  it('signs in instead when the Google account already belongs to a user', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: { oauth: { oauth_google: { existingUser: { emailAddress: EMAIL } } } },
    });

    const { navigate } = await returnFromGoogle(fapi, first, { signInFallbackRedirectUrl: '/home' });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/home')));
    expect(fapi.signUp.transfers).toHaveLength(1);
    expect(fapi.client.sessions).toHaveLength(1);
  });

  it('hands a transfer that still needs a second factor to the sign-in page', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: { oauth: { oauth_google: { existingUser: { emailAddress: EMAIL, secondFactor: true } } } },
    });

    const { navigate } = await returnFromGoogle(fapi, first, { signInUrl: '/sign-in' });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/sign-in')));
    expect(fapi.client.sessions).toHaveLength(0);
  });

  it('shows what went wrong at Google on the start form', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: {
        oauth: { oauth_google: { error: { code: 'oauth_access_denied', message: 'Access was denied.' } } },
      },
    });

    await returnFromGoogle(fapi, first);

    expect(await screen.findByText('You did not grant access to your account.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
  });

  it('keeps the denial on screen when an invitee comes back from Google, and does not redeem the ticket again', async () => {
    window.history.replaceState(null, '', `${window.location.pathname}?__clerk_ticket=tkt_invite`);
    const { fapi, first } = await startWithGoogle({
      signUp: {
        tickets: { tkt_invite: { emailAddress: EMAIL } },
        oauth: { oauth_google: { error: { code: 'oauth_access_denied', message: 'Access was denied.' } } },
      },
    });
    expect(fapi.signUp.updates.at(-1)?.get('strategy')).toBe('oauth_google');

    await returnFromGoogle(fapi, first);

    expect(await screen.findByText('You did not grant access to your account.')).toBeInTheDocument();
    await waitFor(() => expect(window.location.search).not.toContain('__clerk_ticket'));
    expect(screen.getByText('You did not grant access to your account.')).toBeInTheDocument();
    expect(fapi.signUp.creations.filter(body => body.get('strategy') === 'ticket')).toHaveLength(1);
  });

  it('starts a new sign-up from start even when an earlier one is still on the client', async () => {
    const fapi = serveFapi({ environment: socialEnvironment() });
    const { clerk } = await renderWithClerk(
      <>
        <SignUp />
        <RouteProbe />
      </>,
    );
    const leave = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const user = userEvent.setup();
    await submitStart(user);
    await screen.findByRole('heading', { name: 'Verify your email' });
    await codeSent();

    await user.click(screen.getByRole('button', { name: 'Open the start route' }));
    await user.click(await screen.findByRole('button', { name: /Google/ }));

    await waitFor(() => expect(leave).toHaveBeenCalled());
    expect(fapi.signUp.creations).toHaveLength(2);
    expect(fapi.signUp.creations[1].get('strategy')).toBe('oauth_google');
    expect(fapi.signUp.updates.filter(update => update.get('strategy'))).toEqual([]);
  });

  it('offers only the providers on start when the instance signs up with social accounts alone', async () => {
    await renderSignUp({
      environment: socialEnvironment({
        attributes: { email_address: { enabled: false }, password: { enabled: false } },
        user_settings: {
          social: { oauth_google: GOOGLE },
          sign_up: {
            allowlist_only: false,
            progressive: true,
            captcha_enabled: false,
            mode: 'public',
            legal_consent_enabled: true,
          },
        },
      }),
    });

    expect(await screen.findByRole('button', { name: /Google/ })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('asks for the required provider after the user signed up with another one', async () => {
    const github = { ...GOOGLE, strategy: 'oauth_github' as const, name: 'GitHub' };
    const { fapi, first } = await startWithGoogle(
      {
        environment: socialEnvironment({
          user_settings: { social: { oauth_google: { ...GOOGLE, required: true }, oauth_github: github } },
        }),
        signUp: { oauth: { oauth_github: { emailAddress: EMAIL } } },
      },
      undefined,
      /GitHub/,
    );

    await returnFromGoogle(fapi, first);

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /GitHub/ })).toBeNull();
  });

  it('offers Start over when the instance requires two providers a sign-up cannot both link', async () => {
    const github = { ...GOOGLE, strategy: 'oauth_github' as const, name: 'GitHub', required: true };
    const { user } = await renderSignUp({
      environment: socialEnvironment({
        user_settings: { social: { oauth_google: { ...GOOGLE, required: true }, oauth_github: github } },
      }),
    });

    await submitStart(user);
    await enterCode(user);

    expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
  });

  it('takes a user who signs in instead to their pending task', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: {
        oauth: { oauth_google: { existingUser: { emailAddress: EMAIL } } },
        sessionTasks: [{ key: 'choose-organization' }],
      },
    });

    const { navigate } = await returnFromGoogle(fapi, first, {
      signInUrl: '/sign-in',
      signInFallbackRedirectUrl: '/home',
    });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('choose-organization')));
    expect(fapi.signUp.transfers).toHaveLength(1);
    expect(navigate).not.toHaveBeenCalledWith(expect.stringContaining('/home'));
  });

  it('shows a generic error when Google returns one that is not meant for users', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: {
        oauth: { oauth_google: { error: { code: 'internal_clerk_error', message: 'Raw server detail.' } } },
      },
    });

    await returnFromGoogle(fapi, first);

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(screen.queryByText('Raw server detail.')).toBeNull();
  });
});
