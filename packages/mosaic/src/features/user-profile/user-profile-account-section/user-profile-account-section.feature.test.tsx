import type { EmailAddressJSON, EnterpriseAccountConnectionJSON, PhoneNumberJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import {
  type FakeFapiSeed,
  fapiUrl,
  holdRequests,
  serveFapi,
  VERIFICATION_CODE,
  verifyEmailOutOfBand,
  worker,
} from '../../../__tests__/feature/fake-fapi';
import type { FapiAttributeOverrides } from '../../../__tests__/feature/fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileAccountSection } from './user-profile-account-section';

const HOME = fapiPhoneNumber({
  id: 'idn_home',
  phone_number: '+18015550100',
  verification: fapiVerification('phone_code', { status: 'verified' }),
});
const WORK = fapiPhoneNumber({
  id: 'idn_work',
  phone_number: '+18015550199',
  verification: fapiVerification('phone_code', { status: 'verified' }),
});
const HOME_LABEL = '+1 (801) 555-0100';
const WORK_LABEL = '+1 (801) 555-0199';

function signedIn(phones: PhoneNumberJSON[] = [], overrides: Partial<FakeFapiSeed> = {}): FakeFapiSeed {
  const user = fapiUser({
    id: 'user_1',
    first_name: 'Alice',
    last_name: 'Smith',
    username: 'alicesmith',
    email_addresses: [fapiEmailAddress({ id: 'idn_email' })],
    phone_numbers: phones,
    primary_phone_number_id: phones[0]?.id ?? null,
  });
  return {
    environment: fapiEnvironment({ attributes: { phone_number: { enabled: true } } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user })]),
    ...overrides,
  };
}

function withPhoneAttribute(overrides: FapiAttributeOverrides['phone_number']): FakeFapiSeed {
  return signedIn([HOME, WORK], { environment: fapiEnvironment({ attributes: { phone_number: overrides } }) });
}

async function renderSection(seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<UserProfileAccountSection />);
  return { ...view, fapi, actor: userEvent.setup() };
}

type Actor = ReturnType<typeof userEvent.setup>;

const row = () => screen.getByRole('group', { name: 'Phone' });
const listed = () =>
  within(row())
    .queryAllByText(/^\+\d/)
    .map(node => node.textContent);

async function manage(actor: Actor, label: string, action: string) {
  await actor.click(within(row()).getByRole('button', { name: `Manage ${label}` }));
  await actor.click(await screen.findByRole('menuitem', { name: action }));
}

async function addPhone(actor: Actor, digits: string) {
  await actor.click(screen.getByRole('button', { name: 'Add phone number' }));
  await actor.type(screen.getByRole('textbox', { name: 'Phone' }), digits);
  await actor.click(screen.getByRole('button', { name: 'Send code' }));
}

async function enterCode(actor: Actor, code: string) {
  const input = await screen.findByRole('textbox', { name: 'Verification code' });
  await waitFor(() => expect(input).toBeEnabled());
  await actor.click(input);
  await actor.keyboard(code);
}

describe('the user profile phone numbers', () => {
  it('lists the primary number first and marks it', async () => {
    await renderSection(signedIn([HOME, WORK]));

    expect(listed()).toEqual([HOME_LABEL, WORK_LABEL]);
    expect(within(row()).getByText(HOME_LABEL).parentElement).toHaveTextContent('Primary');
  });

  it('says so when no number has been added', async () => {
    await renderSection();

    expect(row()).toHaveTextContent('No phone numbers added');
  });

  it('adds a number, verifies the code it was sent, and lists it', async () => {
    const { actor } = await renderSection();

    await addPhone(actor, '8015550100');
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(listed()).toEqual([HOME_LABEL]);
    expect(row()).not.toHaveTextContent('Unverified');
  });

  it('starts the country on the one the instance located the user in', async () => {
    const { actor } = await renderSection(signedIn([], { country: 'de' }));

    await actor.click(screen.getByRole('button', { name: 'Add phone number' }));

    expect(screen.getByRole('button', { name: 'Country, Germany' })).toBeInTheDocument();
    expect(screen.getByText('+49')).toBeInTheDocument();
  });

  it('keeps the dialog open and says the code was wrong', async () => {
    const { actor } = await renderSection();

    await addPhone(actor, '8015550100');
    await enterCode(actor, '000000');

    expect(await screen.findByText('Incorrect code')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Add phone number' })).toBeInTheDocument();
  });

  it('holds the resend behind a countdown while the code is still fresh', async () => {
    const { actor } = await renderSection();

    await addPhone(actor, '8015550100');

    expect(await screen.findByRole('button', { name: /Didn’t receive a code\? Resend \(\d+\)/ })).toBeDisabled();
  });

  it('verifies a number that was left unverified', async () => {
    const pending = fapiPhoneNumber({ id: 'idn_new', phone_number: '+18015550199' });
    const { actor } = await renderSection(signedIn([HOME, pending]));

    expect(within(row()).getByText(WORK_LABEL).parentElement).toHaveTextContent('Unverified');
    await manage(actor, WORK_LABEL, 'Verify phone number');
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(within(row()).getByText(WORK_LABEL).parentElement).not.toHaveTextContent('Unverified'));
  });

  it('makes another verified number the primary one', async () => {
    const { actor } = await renderSection(signedIn([HOME, WORK]));

    await manage(actor, WORK_LABEL, 'Set as primary');

    await waitFor(() => expect(listed()).toEqual([WORK_LABEL, HOME_LABEL]));
    expect(within(row()).getByText(WORK_LABEL).parentElement).toHaveTextContent('Primary');
  });

  it('removes a number once the removal is confirmed', async () => {
    const { actor } = await renderSection(signedIn([HOME, WORK]));

    await manage(actor, WORK_LABEL, 'Remove phone number');
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove phone number?' });
    expect(dialog).toHaveTextContent(WORK_LABEL);
    await actor.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(listed()).toEqual([HOME_LABEL]));
  });

  it('explains a refused removal in the instance’s own copy', async () => {
    const { actor } = await renderSection(signedIn([HOME, WORK]));
    const destroy = holdRequests('post', '/v1/me/phone_numbers/:id');

    await manage(actor, WORK_LABEL, 'Remove phone number');
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove phone number?' });
    await actor.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(destroy.requests).toHaveLength(1));
    destroy.fail('action_blocked', 'Raw server sentence.');

    expect(await within(dialog).findByText(/Please try again later or contact support/)).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent('Raw server sentence.');
    expect(listed()).toEqual([HOME_LABEL, WORK_LABEL]);
  });

  it('hides the row when the instance does not collect phone numbers', async () => {
    await renderSection(withPhoneAttribute({ enabled: false }));

    expect(screen.queryByRole('group', { name: 'Phone' })).not.toBeInTheDocument();
  });

  it('lists immutable numbers without offering to add or remove one', async () => {
    const { actor } = await renderSection(withPhoneAttribute({ enabled: true, immutable: true }));

    expect(listed()).toEqual([HOME_LABEL, WORK_LABEL]);
    expect(screen.queryByRole('button', { name: 'Add phone number' })).not.toBeInTheDocument();
    await actor.click(within(row()).getByRole('button', { name: `Manage ${WORK_LABEL}` }));

    expect(await screen.findByRole('menuitem', { name: 'Set as primary' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Remove phone number' })).not.toBeInTheDocument();
  });
});

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

const emailRow = () => screen.getByRole('group', { name: 'Email' });
const emailsListed = () =>
  within(emailRow())
    .queryAllByText(/@/)
    .map(node => node.textContent);

async function manageEmail(actor: Actor, label: string, action: string) {
  await actor.click(within(emailRow()).getByRole('button', { name: `Manage ${label}` }));
  await actor.click(await screen.findByRole('menuitem', { name: action }));
}

describe('the user profile email addresses', () => {
  it('adds an address, verifies the code it was sent, and returns focus to the trigger', async () => {
    const { actor } = await renderSection(signedInWithEmails([]));
    const trigger = screen.getByRole('button', { name: 'Add email' });
    expect(emailRow()).toHaveTextContent('No email addresses added');

    await actor.click(trigger);
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
    await actor.click(screen.getByRole('button', { name: 'Continue' }));
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(emailsListed()).toEqual(['new@example.com']);
    expect(emailRow()).not.toHaveTextContent('Unverified');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('verifies an address left unverified and returns focus to its menu', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const { actor } = await renderSection(signedInWithEmails([PRIMARY, pending]));
    const trigger = within(emailRow()).getByRole('button', { name: 'Manage pending@example.com' });
    expect(within(emailRow()).getByText('pending@example.com').parentElement).toHaveTextContent('Unverified');

    await manageEmail(actor, 'pending@example.com', 'Verify');
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(within(emailRow()).getByText('pending@example.com').parentElement).not.toHaveTextContent('Unverified'),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('waits for the emailed link when the instance verifies by link, then closes once it is opened', async () => {
    const pending = fapiEmailAddress({ id: 'idn_pending', email_address: 'pending@example.com' });
    const { actor, fapi } = await renderSection(signedInWithEmails([PRIMARY, pending], verifiesByLink));

    await manageEmail(actor, 'pending@example.com', 'Verify');
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    await waitFor(() => expect(dialog).toHaveTextContent('Open the link we sent to pending@example.com'));
    expect(screen.queryByRole('textbox', { name: 'Verification code' })).not.toBeInTheDocument();

    verifyEmailOutOfBand(fapi, 'idn_pending');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 5000 });
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

  it('hides the row when the instance does not collect email addresses', async () => {
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
});

function fileInput(container: Element): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('expected a file input');
  }
  return input;
}

function failsWith(path: string, error: Record<string, unknown>, status: number) {
  worker.use(http.post(fapiUrl(path), () => HttpResponse.json({ errors: [error] }, { status })));
}

describe('the user profile name, username and picture', () => {
  it('saves an edited name and closes the dialog', async () => {
    const { actor } = await renderSection();

    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.clear(within(dialog).getByLabelText('First name'));
    await actor.type(within(dialog).getByLabelText('First name'), 'Alicia');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Alicia Smith')).toBeInTheDocument();
  });

  it('keeps the username dialog open on the error the server names it for', async () => {
    const { actor } = await renderSection();
    failsWith(
      '/v1/me',
      {
        code: 'form_identifier_exists',
        message: 'Taken',
        long_message: 'That username is taken. Please try another.',
        meta: { param_name: 'username' },
      },
      422,
    );

    await actor.click(screen.getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    await actor.type(within(dialog).getByLabelText('Username'), '2');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByText('That username is taken. Please try another.')).toBeInTheDocument();
  });

  it('uploads a picked picture and then offers to change or remove it', async () => {
    const { actor, container } = await renderSection();

    expect(screen.queryByRole('button', { name: 'Manage profile picture' })).not.toBeInTheDocument();
    await actor.upload(fileInput(container), new File(['x'], 'me.png', { type: 'image/png' }));

    await actor.click(await screen.findByRole('button', { name: 'Manage profile picture' }));
    expect(await screen.findByRole('menuitem', { name: 'Remove avatar' })).toBeInTheDocument();
  });

  it('says why an upload was refused', async () => {
    const { actor, container } = await renderSection();
    failsWith('/v1/me/profile_image', { code: 'avatar_file_size_exceeded', message: 'Too large' }, 413);

    await actor.upload(fileInput(container), new File(['x'], 'me.png', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
    );
  });
});

describe('a contact row the user cannot add to', () => {
  it('is left out when it has nothing to list', async () => {
    await renderSection({
      environment: fapiEnvironment({
        attributes: {
          email_address: { enabled: true, immutable: true },
          phone_number: { enabled: true, immutable: true },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });

    expect(screen.queryByRole('group', { name: 'Email' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Phone' })).not.toBeInTheDocument();
  });
});

describe('a user signed in through an enterprise connection', () => {
  function signedInThroughSso(connection: Partial<EnterpriseAccountConnectionJSON> = {}): FakeFapiSeed {
    const user = fapiUser({
      id: 'user_1',
      first_name: 'Alice',
      last_name: 'Smith',
      email_addresses: [fapiEmailAddress({ id: 'idn_primary', email_address: 'alice@acme.co' })],
      phone_numbers: [HOME],
      primary_phone_number_id: HOME.id,
      enterprise_accounts: [
        fapiEnterpriseAccount({ id: 'eac_1', email_address: 'alice@acme.co' }, { name: 'Acme Corp', ...connection }),
      ],
    });
    return {
      environment: fapiEnvironment({
        attributes: { phone_number: { enabled: true } },
        user_settings: {
          enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user })]),
    };
  }

  it('hands the name to the connection instead of offering to edit it', async () => {
    await renderSection(signedInThroughSso());

    expect(await screen.findByText('Managed by Acme Corp')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
  });

  it('stops the user adding contacts when the connection disables additional identifications', async () => {
    await renderSection(signedInThroughSso({ disable_additional_identifications: true }));

    expect(await screen.findByText('alice@acme.co')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add email' })).not.toBeInTheDocument();
    expect(within(row()).queryByRole('button', { name: 'Add phone number' })).not.toBeInTheDocument();
  });

  it('still lets the user add contacts when the connection allows them', async () => {
    await renderSection(signedInThroughSso({ disable_additional_identifications: false }));

    expect(await screen.findByRole('button', { name: 'Add email' })).toBeInTheDocument();
    expect(within(row()).getByRole('button', { name: 'Add phone number' })).toBeInTheDocument();
  });
});

describe('switching the active user', () => {
  function signedInAsBoth(): FakeFapiSeed {
    const alice = fapiUser({
      id: 'user_1',
      first_name: 'Alice',
      last_name: 'Smith',
      email_addresses: [fapiEmailAddress({ id: 'idn_alice' })],
    });
    const bob = fapiUser({
      id: 'user_2',
      first_name: 'Bob',
      last_name: 'Jones',
      email_addresses: [fapiEmailAddress({ id: 'idn_bob' })],
    });
    return {
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice }), fapiSession({ id: 'sess_2', user: bob })]),
    };
  }

  it('shows the newly active account and drops the draft the other one left open', async () => {
    const { actor, clerk } = await renderSection(signedInAsBoth());

    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.clear(within(dialog).getByLabelText('First name'));
    await actor.type(within(dialog).getByLabelText('First name'), 'Alicia');

    await act(() => clerk.setActive({ session: 'sess_2' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText(/Alic/)).not.toBeInTheDocument();
  });
});

describe('reverification', () => {
  it.todo('confirms it is the user before an email address is added, then adds it');
  it.todo('confirms it is the user before an email address becomes the primary one');
  it.todo('confirms it is the user before a phone number is added, then adds it');
  it.todo('confirms it is the user before a phone number becomes the primary one');
  it.todo('confirms it is the user before the username changes');
  it.todo('leaves the add dialog open and untouched when the confirmation is dismissed');
});
