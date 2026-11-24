import type { SignUpJSON } from '@clerk/shared/types';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, onTestFinished } from 'vitest';

import { tick } from '../../../__tests__/async';
import { type FakeFapiSeed, holdRequests, serveFapi, VERIFICATION_CODE } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  type FapiEnvironment,
  fapiEnvironment,
  type FapiEnvironmentOverrides,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiSignUp,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualSegment, useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp, type SignUpProps } from '../sign-up';

const EMAIL = 'alice@example.com';
const signedInSession = fapiSession({ id: 'sess_existing', user: fapiUser({ id: 'user_existing' }) });
const PASSWORD = 'correct-horse-battery';

function environment({ attributes, ...overrides }: FapiEnvironmentOverrides = {}) {
  return fapiEnvironment({
    attributes: { email_address: { required: true }, password: { required: true }, ...attributes },
    ...overrides,
  });
}

async function renderSignUp(
  seed: FakeFapiSeed = {},
  props: SignUpProps = {},
  options?: Parameters<typeof renderWithClerk>[1],
) {
  const fapi = serveFapi({ environment: environment(), ...seed });
  const view = await renderWithClerk(<SignUp {...props} />, options);
  const user = userEvent.setup();
  return { ...view, fapi, user };
}

function RouteProbe() {
  const parts = useVirtualSegment('/sign-up');
  const write = useVirtualWrite();
  return (
    <>
      <output aria-label='Stored route'>{parts?.join('/') || 'start'}</output>
      <button
        type='button'
        onClick={() => write('/sign-up', [])}
      >
        Open the start route
      </button>
      <button
        type='button'
        onClick={() => write('/sign-up', ['verify-email-address'])}
      >
        Open the verify route
      </button>
      <button
        type='button'
        onClick={() => write('/sign-up', ['continue'])}
      >
        Open the continue route
      </button>
    </>
  );
}

async function renderSignUpInProgress(env: FapiEnvironment, signUp: Partial<SignUpJSON>) {
  const fapi = serveFapi({ environment: env, client: { ...fapiClient(), sign_up: fapiSignUp(signUp) } });
  const view = await renderWithClerk(
    <>
      <SignUp />
      <RouteProbe />
    </>,
  );
  const user = userEvent.setup();
  await screen.findByRole('heading', { name: 'Create your account' });
  return { ...view, fapi, user };
}

function visitWithQuery(query: string) {
  const original = window.location.href;
  window.history.replaceState(null, '', query);
  onTestFinished(() => window.history.replaceState(null, '', original));
}

const emailField = () => screen.getByRole('textbox', { name: 'Email address' });
const passwordField = () => screen.getByLabelText('Password', { selector: 'input' });
const continueButton = () => screen.getByRole('button', { name: 'Continue' });

async function submitStart(user: ReturnType<typeof userEvent.setup>, email = EMAIL) {
  await user.type(await screen.findByRole('textbox', { name: 'Email address' }), email);
  await user.type(passwordField(), PASSWORD);
  await user.click(continueButton());
}

function watchFor(appeared: () => boolean) {
  let seen = false;
  const observer = new MutationObserver(() => {
    seen ||= appeared();
  });
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
  return () => {
    observer.disconnect();
    return seen;
  };
}

const watchForHeading = (name: string | RegExp) => watchFor(() => screen.queryByRole('heading', { name }) !== null);

const codeSent = () => screen.findByRole('button', { name: /^Resend \(\d+\)$/ });

async function enterCode(user: ReturnType<typeof userEvent.setup>, code = VERIFICATION_CODE) {
  await codeSent();
  await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
  await user.keyboard(code);
}

describe('SignUp', () => {
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

  it('shows nothing and is no longer busy when it stays mounted after the session is created', async () => {
    const { user, navigate } = await renderSignUp();

    await submitStart(user);
    await enterCode(user);

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Verify your email' })).toBeNull());
    await tick();
    await tick();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('heading', { name: 'Create your account' })).toBeNull();
    expect(screen.queryByRole('button', { busy: true })).toBeNull();
  });

  it('leaves once and shows nothing when it stays mounted after the session is created in single-session mode', async () => {
    const { user, navigate } = await renderSignUp(
      { environment: environment({ auth_config: { single_session_mode: true } }) },
      {},
      { signUpFallbackRedirectUrl: '/welcome' },
    );

    await submitStart(user);
    await enterCode(user);

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Verify your email' })).toBeNull());
    await tick();
    await tick();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/welcome');
    expect(screen.queryByRole('heading', { name: 'Create your account' })).toBeNull();
  });

  it('leaves for the after sign-up URL without showing the form when a user is signed in, in single-session mode', async () => {
    const sawForm = watchForHeading('Create your account');
    const { navigate } = await renderSignUp(
      {
        environment: environment({ auth_config: { single_session_mode: true } }),
        client: fapiClient([signedInSession]),
      },
      {},
      { signUpFallbackRedirectUrl: '/welcome' },
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome'));
    await tick();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(sawForm()).toBe(false);
  });

  it('shows the form to add another account when a user is signed in, in multi-session mode', async () => {
    const { navigate } = await renderSignUp({ client: fapiClient([signedInSession]) });

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(continueButton()).not.toHaveAttribute('aria-busy', 'true');
    expect(navigate).not.toHaveBeenCalled();
  });

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

  it('shows the organization list only once it has loaded, and leaves once one is chosen', async () => {
    const acme = fapiOrganization({ id: 'org_1', name: 'Acme', slug: 'acme' });
    const { user, navigate } = await renderSignUp(
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
    await tick();
    await tick();
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

  it('keeps Edit disabled until the first code is sent', async () => {
    const { fapi, user } = await renderSignUp();
    const hold = holdRequests('post', '/v1/client/sign_ups/:id/prepare_verification');

    await submitStart(user);
    await waitFor(() => expect(hold.requests).toHaveLength(1));

    expect(await screen.findByRole('button', { name: 'Edit email address' })).toBeDisabled();

    hold.release();
    await codeSent();
    expect(screen.getByRole('button', { name: 'Edit email address' })).toBeEnabled();
    expect(fapi.signUp.preparations).toEqual(['email_code']);
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

  it('keeps Resend locked right after a code is sent', async () => {
    const { fapi, user } = await renderSignUp();

    await submitStart(user);

    expect(await codeSent()).toBeDisabled();
    expect(fapi.signUp.preparations).toEqual(['email_code']);
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

  it('keeps Continue disabled until every required field is filled', async () => {
    const { fapi, user } = await renderSignUp({
      environment: environment({ attributes: { username: { required: true } } }),
    });

    await submitStart(user);

    expect(continueButton()).toHaveAttribute('aria-disabled', 'true');
    expect(fapi.signUp.creations).toHaveLength(0);

    await user.type(screen.getByRole('textbox', { name: 'Username' }), 'alice');
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.creations[0].get('username')).toBe('alice');
    await codeSent();
  });

  it('verifies the email before asking for a missing field, then completes from the continue screen', async () => {
    const { fapi, user, navigate } = await renderSignUpInProgress(
      environment({ attributes: { username: { required: true } } }),
      { email_address: EMAIL, has_password: true },
    );

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
    const { fapi, user, navigate } = await renderSignUpInProgress(environment(), { email_address: EMAIL });

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
    const { fapi, user } = await renderSignUpInProgress(
      environment({
        attributes: { email_address: { required: false }, phone_number: { enabled: true, required: false } },
      }),
      { has_password: true },
    );

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

  it('asks for an email or a phone number on the continue screen of an instance without progressive sign-up', async () => {
    const { fapi, user } = await renderSignUpInProgress(
      environment({
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
      { has_password: true },
    );

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
    const { fapi, user, navigate } = await renderSignUpInProgress(
      environment({
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
      { email_address: EMAIL, has_password: true },
    );

    await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
    await enterCode(user);

    expect(await screen.findByRole('heading', { name: 'Legal consent' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox'));
    await user.click(continueButton());

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.signUp.updates[0].get('legal_accepted')).toBe('true');
  });

  it('offers Start over when the sign-up needs a requirement the continue screen cannot ask for', async () => {
    const { user } = await renderSignUp({
      environment: environment({
        user_settings: {
          social: {
            oauth_google: {
              enabled: true,
              required: true,
              authenticatable: true,
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

  it('replaces the form with the blocked notice when the request is blocked', async () => {
    const { user } = await renderSignUp({
      signUp: { blocked: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' } },
    });

    await submitStart(user);

    expect(await screen.findByRole('heading', { name: 'Request blocked' })).toBeInTheDocument();
    expect(screen.getByText('Contact support.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();
  });

  it('replaces a route the sign-up is not ready for with the screen it shows', async () => {
    serveFapi({ environment: environment() });
    await renderWithClerk(
      <>
        <SignUp />
        <RouteProbe />
      </>,
    );
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.click(screen.getByRole('button', { name: 'Open the verify route' }));

    await waitFor(() => expect(screen.getByRole('status', { name: 'Stored route' })).toHaveTextContent('start'));
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });

  it('shows the code screen and sends no second code when a verify route is reopened while the first sends', async () => {
    const fapi = serveFapi({ environment: environment() });
    await renderWithClerk(
      <>
        <SignUp />
        <RouteProbe />
      </>,
    );
    const user = userEvent.setup();
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
    const fapi = serveFapi({ environment: environment() });
    const { navigate } = await renderWithClerk(
      <>
        <SignUp />
        <RouteProbe />
      </>,
    );
    const user = userEvent.setup();

    await submitStart(user);
    await codeSent();
    await user.click(screen.getByRole('button', { name: 'Edit email address' }));
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
    await codeSent();
    await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
    await user.keyboard(VERIFICATION_CODE);

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.signUp.preparations).toEqual(['email_code']);
  });

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

  it('keeps the redirect_url from the query on the waitlist link', async () => {
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

    await user.click(await screen.findByRole('button', { name: 'Join waitlist' }));

    const [to] = navigate.mock.lastCall ?? [''];
    expect(to).toContain('/waitlist');
    expect(decodeURIComponent(to)).toContain('redirect_url=/dashboard');
  });

  it('shows the waitlist notice in waitlist mode and goes to the waitlist', async () => {
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

    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('waitlist'));
  });
});
