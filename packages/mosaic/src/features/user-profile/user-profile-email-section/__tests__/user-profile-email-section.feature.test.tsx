import type { EmailAddressJSON, EnterpriseAccountConnectionJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  demandReverificationOnce,
  type FakeFapiSeed,
  holdRequests,
  serveFapi,
  VERIFICATION_CODE,
  verifyEmailOutOfBand,
} from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileEmailSection } from '../user-profile-email-section';

const VERIFIED = fapiVerification('email_code', { status: 'verified' });
const PRIMARY = fapiEmailAddress({ id: 'idn_primary', email_address: 'alice@example.com', verification: VERIFIED });

function signedInWithEmails(emails: EmailAddressJSON[], environment = fapiEnvironment()): FakeFapiSeed {
  const user = fapiUser({
    id: 'user_1',
    first_name: 'Alice',
    last_name: 'Smith',
    username: 'alicesmith',
    email_addresses: emails,
    primary_email_address_id: emails[0]?.id ?? null,
  });
  return { environment, client: fapiClient([fapiSession({ id: 'sess_1', user })]) };
}

const verifiesByLink = fapiEnvironment({ attributes: { email_address: { verifications: ['email_link'] } } });

async function renderSection(seed: FakeFapiSeed) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<UserProfileEmailSection />);
  return { ...view, fapi, actor: userEvent.setup() };
}

type Actor = ReturnType<typeof userEvent.setup>;

const emailRow = () => screen.getByRole('group', { name: 'Email' });
const emailsListed = () =>
  within(emailRow())
    .queryAllByText(/@/)
    .map(node => node.textContent);

async function manageEmail(actor: Actor, label: string, action: string) {
  await openMenu(actor, within(emailRow()).getByRole('button', { name: `Manage ${label}` }));
  await actor.click(screen.getByRole('menuitem', { name: action }));
}

async function enterCode(actor: Actor, code: string) {
  const input = await screen.findByRole('textbox', { name: 'Verification code' });
  await waitFor(() => expect(input).not.toHaveAttribute('aria-disabled'));
  await actor.click(input);
  await actor.keyboard(code);
}

describe('the user profile email section', () => {
  it('adds an address and verifies the code it was sent', async () => {
    const { actor } = await renderSection(signedInWithEmails([]));
    expect(emailRow()).toHaveTextContent('No email addresses added');

    await actor.click(screen.getByRole('button', { name: 'Add email' }));
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
    await actor.click(screen.getByRole('button', { name: 'Continue' }));
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['new@example.com']);
    expect(emailRow()).not.toHaveTextContent('Unverified');
  });

  it('keeps Continue pending until the code has been sent', async () => {
    const { actor } = await renderSection(signedInWithEmails([]));
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');
    try {
      await actor.click(screen.getByRole('button', { name: 'Add email' }));
      await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
      await actor.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(prepare.requests).toHaveLength(1));

      expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible();
      expect(screen.queryByRole('textbox', { name: 'Verification code' })).not.toBeInTheDocument();

      prepare.release();
      await enterCode(actor, VERIFICATION_CODE);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(emailsListed()).toEqual(['new@example.com']);
    } finally {
      prepare.release();
    }
  });

  it('keeps existing email Verify pending until code preparation succeeds', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const { actor } = await renderSection(signedInWithEmails([PRIMARY, pending]));
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');
    try {
      await manageEmail(actor, 'pending@example.com', 'Verify');
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      expect(screen.getByRole('button', { name: 'Add email' })).toBeDisabled();
      expect(within(emailRow()).getByText('pending@example.com')).toBeVisible();
      expect(screen.queryByRole('dialog')).toBeNull();
      prepare.release();
      await screen.findByRole('dialog');
      await waitFor(() => expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveFocus());
    } finally {
      prepare.release();
    }
  });

  it('retries failed code preparation from the entry form without another email', async () => {
    const { actor, fapi } = await renderSection(signedInWithEmails([]));
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');
    try {
      await actor.click(screen.getByRole('button', { name: 'Add email' }));
      await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
      await actor.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      prepare.fail('action_blocked');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Continue' })).not.toHaveAttribute('aria-busy', 'true'),
      );
      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('new@example.com');
      const retry = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');
      try {
        await actor.click(screen.getByRole('button', { name: 'Continue' }));
        await waitFor(() => expect(retry.requests).toHaveLength(1));
        expect(fapi.client.sessions[0]?.user.email_addresses).toHaveLength(1);
        retry.release();
        expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
      } finally {
        retry.release();
      }
    } finally {
      prepare.release();
    }
  });

  it('verifies an address left unverified', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const { actor } = await renderSection(signedInWithEmails([PRIMARY, pending]));
    expect(within(emailRow()).getByText('pending@example.com').parentElement).toHaveTextContent('Unverified');

    await manageEmail(actor, 'pending@example.com', 'Verify');
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(within(emailRow()).getByText('pending@example.com').parentElement).not.toHaveTextContent('Unverified'),
    );
  });

  it('waits for the emailed link when the instance verifies by link, then closes once it is opened', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const { actor, fapi } = await renderSection(signedInWithEmails([PRIMARY, pending], verifiesByLink));
    const poll = holdRequests('get', '/v1/me/email_addresses/:id');

    await manageEmail(actor, 'pending@example.com', 'Verify');
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    await waitFor(() => expect(dialog).toHaveTextContent('Open the link we sent to pending@example.com'));
    expect(screen.queryByRole('textbox', { name: 'Verification code' })).not.toBeInTheDocument();
    await waitFor(() => expect(poll.requests).toHaveLength(1));

    verifyEmailOutOfBand(fapi, 'idn_pending');
    poll.release();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('points the emailed link at the user profile on the host origin', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const { actor } = await renderSection(signedInWithEmails([PRIMARY, pending], verifiesByLink));
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');

    await manageEmail(actor, 'pending@example.com', 'Verify');

    await waitFor(() => expect(prepare.requests).toHaveLength(1));
    const [request] = prepare.requests;
    if (!request) {
      throw new Error('expected a prepare_verification request');
    }
    const body = new URLSearchParams(await request.text());
    expect(body.get('strategy')).toBe('email_link');
    expect(body.get('redirect_url')).toBe(new URL('/user-profile#/verify', window.location.origin).href);

    prepare.release();
  });

  it('leaves the address unverified when the link dialog is dismissed', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const { actor } = await renderSection(signedInWithEmails([PRIMARY, pending], verifiesByLink));

    await manageEmail(actor, 'pending@example.com', 'Verify');
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    await actor.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(within(emailRow()).getByText('pending@example.com').parentElement).toHaveTextContent('Unverified');
  });

  it('sends the user to the identity provider for an address that matches an SSO connection, even when the instance verifies by link', async () => {
    const sso = fapiEmailAddress({
      id: 'idn_sso',
      email_address: 'alice@acme.co',
      matches_sso_connection: true,
    });
    const { actor, clerk } = await renderSection(signedInWithEmails([PRIMARY, sso], verifiesByLink));
    const windowNavigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});

    await manageEmail(actor, 'alice@acme.co', 'Verify');
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    expect(dialog).toHaveTextContent('acme.co');
    expect(screen.queryByRole('textbox', { name: 'Verification code' })).not.toBeInTheDocument();
    await actor.click(within(dialog).getByRole('button', { name: 'Connect' }));

    await waitFor(() => expect(windowNavigate).toHaveBeenCalledWith(new URL('https://idp.acme.co/sso')));
  });

  it('does not offer to add the username as an address', async () => {
    const { actor } = await renderSection(
      signedInWithEmails([], fapiEnvironment({ attributes: { username: { enabled: true } } })),
    );

    await actor.click(screen.getByRole('button', { name: 'Add email' }));
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'alicesmith');

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('is left out when the instance does not collect email addresses', async () => {
    await renderSection(
      signedInWithEmails(
        [],
        fapiEnvironment({
          attributes: { email_address: { enabled: false, used_for_first_factor: false, first_factors: [] } },
        }),
      ),
    );

    expect(screen.queryByRole('group', { name: 'Email' })).not.toBeInTheDocument();
  });

  it('is left out when it is immutable and has nothing to list', async () => {
    await renderSection(
      signedInWithEmails([], fapiEnvironment({ attributes: { email_address: { enabled: true, immutable: true } } })),
    );

    expect(screen.queryByRole('group', { name: 'Email' })).not.toBeInTheDocument();
  });
});

describe('the email section for a user signed in through an enterprise connection', () => {
  function signedInThroughSso(connection: Partial<EnterpriseAccountConnectionJSON>): FakeFapiSeed {
    const user = fapiUser({
      id: 'user_1',
      email_addresses: [fapiEmailAddress({ id: 'idn_primary', email_address: 'alice@acme.co' })],
      enterprise_accounts: [
        fapiEnterpriseAccount({ id: 'eac_1', email_address: 'alice@acme.co' }, { name: 'Acme Corp', ...connection }),
      ],
    });
    return {
      environment: fapiEnvironment({
        user_settings: {
          enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user })]),
    };
  }

  it('stops the user adding an address when the connection disables additional identifications', async () => {
    await renderSection(signedInThroughSso({ disable_additional_identifications: true }));

    expect(await screen.findByText('alice@acme.co')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add email' })).not.toBeInTheDocument();
  });

  it('still lets the user add an address when the connection allows it', async () => {
    await renderSection(signedInThroughSso({ disable_additional_identifications: false }));

    expect(await screen.findByRole('button', { name: 'Add email' })).toBeInTheDocument();
  });
});

describe('email reverification', () => {
  it('sets a verified address as primary without a challenge when none is required', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor, fapi } = await renderSection(signedInWithEmails([PRIMARY, second]));

    await manageEmail(actor, 'bob@example.com', 'Set as primary');

    await waitFor(() => expect(fapi.client.sessions[0]?.user?.primary_email_address_id).toBe('idn_second'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('verifies the session before setting an address as primary and returns focus to its menu', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor, fapi } = await renderSection({
      ...signedInWithEmails([PRIMARY, second]),
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me');

    await manageEmail(actor, 'bob@example.com', 'Set as primary');
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await actor.keyboard('hunter2{Enter}');

    await waitFor(() => expect(fapi.client.sessions[0]?.user?.primary_email_address_id).toBe('idn_second'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(within(emailRow()).getByRole('button', { name: 'Manage bob@example.com' })).toHaveFocus();
  });

  it('lets the user cancel verification quietly and retry the primary action', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor, fapi } = await renderSection({
      ...signedInWithEmails([PRIMARY, second]),
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me');

    await manageEmail(actor, 'bob@example.com', 'Set as primary');
    await screen.findByText('Enter your current password to continue');
    const dialog = screen.getByRole('dialog');
    await actor.click(within(dialog).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user?.primary_email_address_id).toBe('idn_primary');
    expect(within(emailRow()).queryByRole('alert')).toBeNull();
    expect(within(emailRow()).getByRole('button', { name: 'Manage bob@example.com' })).toHaveFocus();

    await manageEmail(actor, 'bob@example.com', 'Set as primary');
    await waitFor(() => expect(fapi.client.sessions[0]?.user?.primary_email_address_id).toBe('idn_second'));
  });

  it('keeps the verification dialog open while retrying and reports an ordinary retry error', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor, fapi } = await renderSection({
      ...signedInWithEmails([PRIMARY, second]),
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me');

    await manageEmail(actor, 'bob@example.com', 'Set as primary');
    await screen.findByText('Enter your current password to continue');
    const dialog = screen.getByRole('dialog');
    const replay = holdRequests('post', '/v1/me');
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await actor.keyboard('hunter2{Enter}');
    await waitFor(() => expect(replay.requests).toHaveLength(1));

    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    await actor.keyboard('{Escape}');
    expect(dialog).toBeVisible();
    expect(fapi.client.sessions[0]?.user?.primary_email_address_id).toBe('idn_primary');

    replay.fail('action_blocked', 'Unable to set primary address.');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(within(emailRow()).getByRole('alert')).toHaveTextContent("This action couldn't be completed."),
    );
  });

  it('keeps the profile visible until primary-action verification is ready', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor } = await renderSection({
      ...signedInWithEmails([PRIMARY, second]),
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me');
    const start = holdRequests('post', '/v1/client/sessions/:id/verify');

    try {
      await manageEmail(actor, 'bob@example.com', 'Set as primary');
      await waitFor(() => expect(start.requests).toHaveLength(1));
      expect(within(emailRow()).getByText('bob@example.com')).toBeVisible();
      expect(screen.queryByRole('dialog')).toBeNull();
      start.release();
      await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    } finally {
      start.release();
    }
  });

  it('shows the section error when the primary action fails after closing the menu', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor } = await renderSection(signedInWithEmails([PRIMARY, second]));
    const mutation = holdRequests('post', '/v1/me');
    const trigger = within(emailRow()).getByRole('button', { name: 'Manage bob@example.com' });

    try {
      await manageEmail(actor, 'bob@example.com', 'Set as primary');
      await waitFor(() => expect(mutation.requests).toHaveLength(1));
      mutation.fail('action_blocked', 'Unable to set primary address.');
      await waitFor(() =>
        expect(within(emailRow()).getByRole('alert')).toHaveTextContent("This action couldn't be completed."),
      );
      await openMenu(actor, trigger);
      expect(screen.getByRole('menuitem', { name: 'Set as primary' })).not.toHaveAttribute('aria-disabled');
    } finally {
      mutation.release();
    }
  });

  it('replaces a failed verify error with a later primary action error', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor } = await renderSection(signedInWithEmails([PRIMARY, pending, second]));
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');
    const mutation = holdRequests('post', '/v1/me');

    try {
      await manageEmail(actor, 'pending@example.com', 'Verify');
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      prepare.fail('too_many_requests', 'Too many requests.');
      await waitFor(() => expect(within(emailRow()).getByRole('alert')).toHaveTextContent('Too many requests.'));

      await manageEmail(actor, 'bob@example.com', 'Set as primary');
      await waitFor(() => expect(mutation.requests).toHaveLength(1));
      mutation.fail('action_blocked', 'Unable to set primary address.');
      await waitFor(() =>
        expect(within(emailRow()).getByRole('alert')).toHaveTextContent("This action couldn't be completed."),
      );
    } finally {
      prepare.release();
      mutation.release();
    }
  });

  it('focuses Close when the dialog opens on a verification that could not start', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor } = await renderSection({
      ...signedInWithEmails([PRIMARY, second]),
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me');
    const start = holdRequests('post', '/v1/client/sessions/:id/verify');

    await manageEmail(actor, 'bob@example.com', 'Set as primary');
    await waitFor(() => expect(start.requests).toHaveLength(1));
    start.fail('verification_failed', 'Unable to start verification.');

    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getAllByRole('button', { name: 'Close' })[0]).toHaveFocus());
  });

  const challengedSeed = (environment = fapiEnvironment()): FakeFapiSeed => ({
    ...signedInWithEmails([], environment),
    verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' }] },
  });

  async function beginAdd(actor: Actor, address = 'new@example.com') {
    await actor.click(screen.getByRole('button', { name: 'Add email' }));
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), address);
    await actor.click(screen.getByRole('button', { name: 'Continue' }));
  }

  it('holds password confirmation until email code preparation finishes', async () => {
    const { actor } = await renderSection(challengedSeed());
    demandReverificationOnce('/v1/me/email_addresses');
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');

    try {
      await beginAdd(actor);
      await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
      await waitFor(() => expect(prepare.requests).toHaveLength(1));

      expect(screen.getByLabelText('Password')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByRole('textbox', { name: 'Email' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
      await actor.keyboard('{Escape}{Enter}');
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(prepare.requests).toHaveLength(1);

      prepare.release();
      const input = await screen.findByRole('textbox', { name: 'Verification code' });
      await waitFor(() => expect(input).not.toHaveAttribute('aria-disabled'));
      expect(input).toBeVisible();
    } finally {
      prepare.release();
    }
  });

  it('returns to the email form after preparation fails', async () => {
    const { actor } = await renderSection(challengedSeed());
    demandReverificationOnce('/v1/me/email_addresses');
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');

    try {
      await beginAdd(actor);
      await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      expect(screen.getByLabelText('Password')).toBeVisible();
      prepare.fail('form_param_invalid', 'Could not send code.', 'email_address');

      const input = await screen.findByRole('textbox', { name: 'Email' });
      await waitFor(() => expect(input).toHaveFocus());
      await waitFor(() => expect(input).toHaveAccessibleDescription('Could not send code.'));
    } finally {
      prepare.release();
    }
  });

  it('confirms it is the user before an email address is added, then verifies its code', async () => {
    const { actor, fapi } = await renderSection(challengedSeed());
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);

    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    expect(fapi.client.sessions[0]?.user.email_addresses).toHaveLength(0);
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await actor.keyboard('hunter2{Enter}');
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['new@example.com']);
  });
  it('focuses the session verification code before adding an email address', async () => {
    const { actor, fapi } = await renderSection({
      ...signedInWithEmails([PRIMARY]),
      verification: {
        firstFactors: [
          { strategy: 'email_code', email_address_id: PRIMARY.id, safe_identifier: PRIMARY.email_address },
        ],
        secrets: { email_code: VERIFICATION_CODE },
      },
    });
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await waitFor(() => expect(code).toHaveFocus());
    await waitFor(() => expect(fapi.verification.firstFactorVerification?.strategy).toBe('email_code'));
    await actor.keyboard(VERIFICATION_CODE);

    await screen.findByRole('dialog', { name: 'Verify your email' });
    await enterCode(actor, VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['alice@example.com', 'new@example.com']);
  });

  it('closes quietly when confirmation is dismissed and starts clean on reopen', async () => {
    const { actor, fapi } = await renderSection(challengedSeed());
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    await screen.findByPlaceholderText('Enter your password');
    await actor.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fapi.client.sessions[0]?.user.email_addresses).toHaveLength(0);
    await actor.click(screen.getByRole('button', { name: 'Add email' }));
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('');
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'retry@example.com');
    await actor.click(screen.getByRole('button', { name: 'Continue' }));
    await enterCode(actor, VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['retry@example.com']);
  });

  it('continues to the emailed link after confirming the session', async () => {
    const { actor, fapi } = await renderSection(challengedSeed(verifiesByLink));
    const poll = holdRequests('get', '/v1/me/email_addresses/:id');
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    await waitFor(() => expect(dialog).toHaveTextContent('Open the link we sent to new@example.com'));
    expect(screen.queryByRole('textbox', { name: 'Verification code' })).not.toBeInTheDocument();
    await waitFor(() => expect(poll.requests).toHaveLength(1));
    const added = fapi.client.sessions[0]?.user.email_addresses[0];
    if (!added) {
      throw new Error('Expected the new email address');
    }
    verifyEmailOutOfBand(fapi, added.id);
    poll.release();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['new@example.com']);
  });

  it('keeps an initial create pending through duplicate submit and dismissal attempts', async () => {
    const { actor } = await renderSection(signedInWithEmails([]));
    const create = holdRequests('post', '/v1/me/email_addresses');

    await beginAdd(actor);
    await waitFor(() => expect(create.requests).toHaveLength(1));
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-disabled', 'true');
    await actor.keyboard('{Escape}{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(create.requests).toHaveLength(1);

    create.release();
    await enterCode(actor, VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['new@example.com']);
  });

  it('allows cancellation while the session challenge loads', async () => {
    const { actor, fapi } = await renderSection(challengedSeed());
    const start = holdRequests('post', '/v1/client/sessions/sess_1/verify');
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    await waitFor(() => expect(start.requests).toHaveLength(1));
    await actor.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fapi.client.sessions[0]?.user.email_addresses).toHaveLength(0);
    start.release();
  });

  it('keeps the retried create locked and returns the email field error without a duplicate', async () => {
    const { actor, fapi } = await renderSection(challengedSeed());
    const retry = holdRequests('post', '/v1/me/email_addresses');
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
    await waitFor(() => expect(retry.requests).toHaveLength(1));
    await actor.keyboard('{Escape}{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(retry.requests).toHaveLength(1);
    retry.fail('form_param_invalid', 'That email is taken.', 'email_address');

    const email = await screen.findByRole('textbox', { name: 'Email' });
    expect(email).toHaveValue('new@example.com');
    await waitFor(() => expect(email).toHaveAccessibleDescription('That email is taken.'));
    expect(fapi.client.sessions[0]?.user.email_addresses).toHaveLength(0);
  });

  it('focuses the email field when returning to the form after verifying', async () => {
    const { actor } = await renderSection(challengedSeed());
    const retry = holdRequests('post', '/v1/me/email_addresses');
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
    await waitFor(() => expect(retry.requests).toHaveLength(1));
    retry.fail('form_param_invalid', 'That email is taken.', 'email_address');

    const email = await screen.findByRole('textbox', { name: 'Email' });
    await waitFor(() => expect(email).toHaveFocus());
  });

  it('cancels an in-progress verification when the active session changes', async () => {
    const seed = challengedSeed();
    const { actor, fapi, clerk } = await renderSection({
      ...seed,
      client: fapiClient([
        ...seed.client.sessions,
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', username: 'bob' }) }),
      ]),
    });
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    await screen.findByPlaceholderText('Enter your password');
    await act(() => clerk.setActive({ session: 'sess_2' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fapi.client.sessions.map(session => session.user.email_addresses)).toEqual([[], []]);
  });

  it('closes the host from the challenge error card', async () => {
    const { actor, fapi } = await renderSection(challengedSeed());
    holdRequests('post', '/v1/client/sessions/sess_1/verify').fail('some_new_error', 'Nope');
    demandReverificationOnce('/v1/me/email_addresses');

    await beginAdd(actor);
    expect(await screen.findByText('Something went wrong')).toBeVisible();
    const buttons = screen.getAllByRole('button', { name: 'Close' });
    const close = buttons.at(-1);
    if (!close) {
      throw new Error('Expected a close button');
    }
    await actor.click(close);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fapi.client.sessions[0]?.user.email_addresses).toHaveLength(0);
  });
});

describe('Removing an address', () => {
  it('verifies the session when the removal demands it, then removes the address', async () => {
    const second = fapiEmailAddress({ id: 'idn_second', email_address: 'bob@example.com', verification: VERIFIED });
    const { actor } = await renderSection({
      ...signedInWithEmails([PRIMARY, second]),
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me/email_addresses/idn_second');

    await manageEmail(actor, 'bob@example.com', 'Remove email');
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove email address?' });
    await actor.click(within(dialog).getByRole('button', { name: 'Remove' }));

    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await actor.type(screen.getByLabelText('Password'), 'hunter2{Enter}');

    await waitFor(() => expect(emailsListed()).toEqual(['alice@example.com']));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
