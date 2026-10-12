import type { EmailAddressJSON, EnterpriseAccountConnectionJSON } from '@clerk/shared/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
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
  await actor.click(within(emailRow()).getByRole('button', { name: `Manage ${label}` }));
  await actor.click(await screen.findByRole('menuitem', { name: action }));
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

  it('holds the code field until the code has been sent', async () => {
    const { actor } = await renderSection(signedInWithEmails([]));
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');

    await actor.click(screen.getByRole('button', { name: 'Add email' }));
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
    await actor.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(prepare.requests).toHaveLength(1));

    expect(await screen.findByRole('textbox', { name: 'Verification code' })).toHaveAttribute('aria-disabled', 'true');

    prepare.release();
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['new@example.com']);
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
  it.todo('confirms it is the user before an email address is added, then adds it');
  it.todo('confirms it is the user before an email address becomes the primary one');
  it.todo('leaves the add dialog open and untouched when the confirmation is dismissed');
});
