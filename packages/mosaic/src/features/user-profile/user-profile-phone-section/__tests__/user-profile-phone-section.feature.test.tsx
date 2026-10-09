import type { EnterpriseAccountConnectionJSON, PhoneNumberJSON } from '@clerk/shared/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi, VERIFICATION_CODE } from '../../../../__tests__/feature/fake-fapi';
import type { FapiAttributeOverrides } from '../../../../__tests__/feature/fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfilePhoneSection } from '../user-profile-phone-section';

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
  const view = await renderWithClerk(<UserProfilePhoneSection />);
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
  await waitFor(() => expect(input).not.toHaveAttribute('aria-disabled'));
  await actor.click(input);
  await actor.keyboard(code);
}

describe('the user profile phone section', () => {
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
    expect(screen.getByRole('dialog', { name: 'Verify your phone number' })).toBeInTheDocument();
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

  it('is left out when the instance does not collect phone numbers', async () => {
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

  it('is left out when it is immutable and has nothing to list', async () => {
    await renderSection(
      signedIn([], {
        environment: fapiEnvironment({ attributes: { phone_number: { enabled: true, immutable: true } } }),
      }),
    );

    expect(screen.queryByRole('group', { name: 'Phone' })).not.toBeInTheDocument();
  });
});

describe('the phone section for a user signed in through an enterprise connection', () => {
  function signedInThroughSso(connection: Partial<EnterpriseAccountConnectionJSON>): FakeFapiSeed {
    const user = fapiUser({
      id: 'user_1',
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

  it('stops the user adding a number when the connection disables additional identifications', async () => {
    await renderSection(signedInThroughSso({ disable_additional_identifications: true }));

    expect(listed()).toEqual([HOME_LABEL]);
    expect(screen.queryByRole('button', { name: 'Add phone number' })).not.toBeInTheDocument();
  });

  it('still lets the user add a number when the connection allows it', async () => {
    await renderSection(signedInThroughSso({ disable_additional_identifications: false }));

    expect(within(row()).getByRole('button', { name: 'Add phone number' })).toBeInTheDocument();
  });
});

describe('phone reverification', () => {
  it.todo('confirms it is the user before a phone number is added, then adds it');
  it.todo('confirms it is the user before a phone number becomes the primary one');
  it.todo('leaves the add dialog open and untouched when the confirmation is dismissed');
});
