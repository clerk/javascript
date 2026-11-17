import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi, VERIFICATION_CODE } from '../../../__tests__/feature/fake-fapi';
import { fapiEnvironment, type FapiEnvironmentOverrides } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualSegment, useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp, type SignUpProps } from '../sign-up';

const EMAIL = 'alice@example.com';
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
        onClick={() => write('/sign-up', ['verify-email-address'])}
      >
        Open the verify route
      </button>
    </>
  );
}

const emailField = () => screen.getByRole('textbox', { name: 'Email address' });
const passwordField = () => screen.getByLabelText('Password', { selector: 'input' });
const continueButton = () => screen.getByRole('button', { name: 'Continue' });

async function submitStart(user: ReturnType<typeof userEvent.setup>, email = EMAIL) {
  await user.type(await screen.findByRole('textbox', { name: 'Email address' }), email);
  await user.type(passwordField(), PASSWORD);
  await user.click(continueButton());
}

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

  it('goes to the session task when the new session has one', async () => {
    const { user, navigate } = await renderSignUp({ signUp: { sessionTasks: [{ key: 'choose-organization' }] } });

    await submitStart(user);
    await enterCode(user);

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('tasks/choose-organization')));
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

  it('sends a code for the new sign-up when the address is edited while the first code is sending', async () => {
    const { fapi, user } = await renderSignUp();
    const hold = holdRequests('post', '/v1/client/sign_ups/:id/prepare_verification');

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'Edit email address' }));
    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(hold.requests).toHaveLength(2));
    hold.release();

    await codeSent();
    expect(fapi.signUp.creations).toHaveLength(2);
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

  it('returns to the form with the address kept when the user edits it', async () => {
    const { user } = await renderSignUp();

    await submitStart(user);
    await codeSent();
    await user.click(screen.getByRole('button', { name: 'Edit email address' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(emailField()).toHaveValue(EMAIL);
  });

  it('verifies the email before asking for a missing field, then completes from the continue screen', async () => {
    const { fapi, user, navigate } = await renderSignUp({
      environment: environment({ attributes: { username: { required: true } } }),
    });

    await submitStart(user);

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();

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

  it('offers Start over on an instance that verifies email by link', async () => {
    const { fapi, user } = await renderSignUp({
      environment: environment({ attributes: { email_address: { required: true, verifications: ['email_link'] } } }),
    });

    await submitStart(user);

    expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
    expect(fapi.signUp.preparations).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Start over' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(emailField()).toHaveValue('');
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

  it('links to sign-in from the form', async () => {
    const { user, navigate } = await renderSignUp();

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/sign-in'));
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
