import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp } from '../sign-up';
import {
  codeSent,
  continueButton,
  EMAIL,
  emailField,
  environment,
  PASSWORD,
  passwordField,
  renderSignUp,
  RouteProbe,
  submitStart,
  watchForHeading,
} from './sign-up.fixtures';

const INVALID_INVITATION =
  'This link is no longer valid or has already been used. Please start again or request a new link.';

afterEach(() => {
  window.history.replaceState(null, '', window.location.pathname);
});

function openInvitation(param: '__clerk_ticket' | '__clerk_invitation_token', ticket: string) {
  window.history.replaceState(null, '', `${window.location.pathname}?${param}=${ticket}`);
}

function Reopenable() {
  const [opened, setOpened] = useState(1);
  const write = useVirtualWrite();
  return (
    <>
      <SignUp key={opened} />
      <button
        type='button'
        onClick={() => {
          write('/sign-up', []);
          setOpened(opened + 1);
        }}
      >
        Reopen sign-up
      </button>
    </>
  );
}

function serveCompleteInvitation() {
  openInvitation('__clerk_ticket', 'tkt_complete');
  return serveFapi({
    environment: environment({ attributes: { password: { enabled: false } } }),
    signUp: { tickets: { tkt_complete: { emailAddress: EMAIL } } },
  });
}

describe('opening an invitation', () => {
  it('redeems an invitation, asks for the password it did not set, and completes', async () => {
    openInvitation('__clerk_ticket', 'tkt_invite');
    const { fapi, user, navigate } = await renderSignUp({
      signUp: { tickets: { tkt_invite: { emailAddress: EMAIL } } },
    });

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(fapi.signUp.creations[0].get('strategy')).toBe('ticket');
    expect(fapi.signUp.creations[0].get('ticket')).toBe('tkt_invite');
    expect(fapi.signUp.preparations).toEqual([]);

    await user.type(passwordField(), PASSWORD);
    await user.click(continueButton());

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.signUp.updates[0].get('password')).toBe(PASSWORD);
    expect(fapi.client.sessions).toHaveLength(1);
    expect(window.location.search).not.toContain('__clerk_ticket');
  });

  it('redeems a ticket passed as __clerk_invitation_token', async () => {
    openInvitation('__clerk_invitation_token', 'tkt_token');
    const { fapi } = await renderSignUp({ signUp: { tickets: { tkt_token: { emailAddress: EMAIL } } } });

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(fapi.signUp.creations[0].get('ticket')).toBe('tkt_token');
  });

  it('redeems an invitation when another sign-up is already in progress', async () => {
    const fapi = serveFapi({ environment: environment(), signUp: { tickets: { tkt_new: { emailAddress: EMAIL } } } });
    await renderWithClerk(<Reopenable />);
    const user = userEvent.setup();
    await submitStart(user, 'bob@example.com');
    await screen.findByRole('heading', { name: 'Verify your email' });
    await codeSent();

    openInvitation('__clerk_ticket', 'tkt_new');
    await user.click(screen.getByRole('button', { name: 'Reopen sign-up' }));

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(fapi.signUp.creations).toHaveLength(2);
    expect(fapi.signUp.creations[1].get('ticket')).toBe('tkt_new');
  });

  it('lets an invitee through restricted mode, including back on the start form', async () => {
    openInvitation('__clerk_ticket', 'tkt_restricted');
    const fapi = serveFapi({
      environment: environment({
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
      signUp: { tickets: { tkt_restricted: { emailAddress: EMAIL } } },
    });
    await renderWithClerk(
      <>
        <SignUp />
        <RouteProbe />
      </>,
    );
    const user = userEvent.setup();
    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open the start route' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Access restricted' })).toBeNull();
    expect(emailField()).toHaveAttribute('aria-disabled', 'true');
    expect(fapi.signUp.creations).toHaveLength(1);
  });
});

describe('opening an invitation that cannot be redeemed', () => {
  it.each([
    { kind: 'rejected', ticket: 'tkt_unknown', seed: {}, message: INVALID_INVITATION },
    {
      kind: 'expired',
      ticket: 'tkt_expired',
      seed: { signUp: { tickets: { tkt_expired: 'expired' as const } } },
      message: 'This link has expired. Please start again or request a new link.',
    },
  ])('shows an $kind invitation on the start form, then signs up normally', async ({ ticket, seed, message }) => {
    openInvitation('__clerk_ticket', ticket);
    const { fapi, user } = await renderSignUp(seed);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(window.location.search).not.toContain('__clerk_ticket');
    expect(emailField()).not.toHaveAttribute('aria-disabled');

    await submitStart(user);

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.creations).toHaveLength(2);
    expect(fapi.signUp.creations[1].get('strategy')).toBeNull();
    await codeSent();
  });

  it('clears a rejected invitation error once the user submits the start form', async () => {
    openInvitation('__clerk_ticket', 'tkt_unknown');
    const { user } = await renderSignUp();
    await screen.findByText(INVALID_INVITATION);

    await user.type(emailField(), EMAIL);
    await user.type(passwordField(), 'a');
    await user.click(continueButton());

    await waitFor(() => expect(screen.queryByText(INVALID_INVITATION)).toBeNull());
  });

  it('replaces the form with the blocked notice when redeeming the invitation is blocked', async () => {
    openInvitation('__clerk_ticket', 'tkt_invite');
    await renderSignUp({
      signUp: {
        tickets: { tkt_invite: { emailAddress: EMAIL } },
        blocked: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' },
      },
    });

    expect(await screen.findByRole('heading', { name: 'Request blocked' })).toBeInTheDocument();
    expect(screen.getByText('Contact support.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();
  });
});

describe('going back to the start form after opening an invitation', () => {
  it('keeps the invitation when the user goes back to the start form', async () => {
    openInvitation('__clerk_ticket', 'tkt_back');
    const fapi = serveFapi({ environment: environment(), signUp: { tickets: { tkt_back: { emailAddress: EMAIL } } } });
    const { navigate } = await renderWithClerk(
      <>
        <SignUp />
        <RouteProbe />
      </>,
    );
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Fill in missing fields' });

    await user.click(screen.getByRole('button', { name: 'Open the start route' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(emailField()).toHaveValue(EMAIL);
    expect(emailField()).toHaveAttribute('aria-disabled', 'true');
    await user.type(passwordField(), PASSWORD);
    await user.click(continueButton());

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(fapi.signUp.updates[0].get('password')).toBe(PASSWORD);
    expect(fapi.signUp.updates[0].get('email_address')).toBeNull();
  });

  it('starts a new sign-up when a later visit has no ticket in the URL', async () => {
    openInvitation('__clerk_ticket', 'tkt_abandoned');
    const fapi = serveFapi({
      environment: environment(),
      signUp: { tickets: { tkt_abandoned: { emailAddress: EMAIL } } },
    });
    await renderWithClerk(<Reopenable />);
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Fill in missing fields' });

    window.history.replaceState(null, '', window.location.pathname);
    await user.click(screen.getByRole('button', { name: 'Reopen sign-up' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(emailField()).not.toHaveAttribute('aria-disabled');
    await user.clear(emailField());
    await submitStart(user, 'bob@example.com');

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.creations).toHaveLength(2);
    expect(fapi.signUp.creations[1].get('email_address')).toBe('bob@example.com');
    expect(fapi.signUp.updates).toHaveLength(0);
    await codeSent();
  });
});

describe('when the invitation is all the sign-up needs', () => {
  it('keeps the loading screen up until it leaves, without showing the form or redeeming twice', async () => {
    const fapi = serveCompleteInvitation();
    const hold = holdRequests('post', '/v1/client/sessions/:id/touch');
    const sawForm = watchForHeading('Create your account');
    const { navigate } = await renderWithClerk(<SignUp />);

    await waitFor(() => expect(hold.requests).toHaveLength(1));
    expect(screen.queryByRole('heading', { name: 'Create your account' })).toBeNull();
    expect(screen.getByRole('progressbar', { name: 'Loading…' })).toBeInTheDocument();
    hold.release();

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(sawForm()).toBe(false);
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(fapi.client.sessions).toHaveLength(1);
    expect(window.location.search).not.toContain('__clerk_ticket');
  });

  it('shows why on the start form, with the way to sign in, when the new session cannot be activated', async () => {
    const fapi = serveCompleteInvitation();
    const hold = holdRequests('post', '/v1/client/sessions/:id/touch');
    const { navigate } = await renderWithClerk(<SignUp />);

    await waitFor(() => expect(hold.requests).toHaveLength(1));
    hold.fail('form_param_invalid', 'The session could not be activated.');

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('The session could not be activated.'));
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar', { name: 'Loading…' })).toBeNull();
    expect(continueButton()).not.toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    expect(fapi.signUp.creations).toHaveLength(1);
  });
});
