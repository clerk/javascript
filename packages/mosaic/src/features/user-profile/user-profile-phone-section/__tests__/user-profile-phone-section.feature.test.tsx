import type { EnterpriseAccountConnectionJSON, PhoneNumberJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  demandReverificationOnce,
  type FakeFapiSeed,
  holdRequests,
  serveFapi,
  VERIFICATION_CODE,
} from '../../../../__tests__/feature/fake-fapi';
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
import { openMenu } from '../../../../__tests__/feature/menu';
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
  await openMenu(actor, within(row()).getByRole('button', { name: `Manage ${label}` }));
  await actor.click(screen.getByRole('menuitem', { name: action }));
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
  it('closes the menu and blocks conflicting actions while setting a number as primary', async () => {
    const { actor } = await renderSection(signedIn([HOME, WORK]));
    const primary = holdRequests('post', '/v1/me');
    try {
      await manage(actor, WORK_LABEL, 'Set as primary');
      await waitFor(() => expect(primary.requests).toHaveLength(1));
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      const manageWork = screen.getByRole('button', { name: `Manage ${WORK_LABEL}` });
      expect(manageWork).toHaveAttribute('aria-disabled', 'true');
      await actor.click(manageWork);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(screen.getByRole('button', { name: 'Add phone number' })).toBeDisabled();
      expect(await screen.findByRole('progressbar', { name: 'Set as primary' })).toBeVisible();
    } finally {
      primary.release();
      await waitFor(() => expect(within(row()).getByText(WORK_LABEL).parentElement).toHaveTextContent('Primary'));
    }
    expect(screen.getByRole('button', { name: `Manage ${WORK_LABEL}` })).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('progressbar', { name: 'Set as primary' })).toBeNull();
  });

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

    expect(await screen.findByRole('button', { name: /Resend \(\d+\)/ })).toBeDisabled();
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

  it('holds the menu open with a spinner on Verify until the code is sent', async () => {
    const pending = fapiPhoneNumber({ id: 'idn_new', phone_number: '+18015550199' });
    const { actor } = await renderSection(signedIn([HOME, pending]));
    const prepare = holdRequests('post', '/v1/me/phone_numbers/:id/prepare_verification');

    try {
      await manage(actor, WORK_LABEL, 'Verify phone number');
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      expect(screen.getByRole('menu')).toBeVisible();
      expect(screen.getByRole('menuitem', { name: 'Verify phone number' })).toHaveAttribute('aria-busy', 'true');
      expect(await screen.findByRole('progressbar', { name: 'Verify phone number' })).toBeVisible();
      expect(screen.queryByRole('dialog')).toBeNull();
    } finally {
      prepare.release();
    }

    await enterCode(actor, VERIFICATION_CODE);
    expect(screen.queryByRole('menu')).toBeNull();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
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
  const challenged = (overrides: Partial<FakeFapiSeed> = {}): FakeFapiSeed =>
    signedIn([], {
      verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' }] },
      ...overrides,
    });
  const savedPhones = (fapi: ReturnType<typeof serveFapi>) => fapi.client.sessions[0]?.user.phone_numbers;

  it('confirms it is the user before a phone number is added, then verifies its code', async () => {
    const { actor, fapi } = await renderSection(challenged());
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');

    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    expect(savedPhones(fapi)).toHaveLength(0);
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await actor.keyboard('hunter2{Enter}');
    await enterCode(actor, VERIFICATION_CODE);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(listed()).toEqual([HOME_LABEL]);
  });

  it('focuses the session verification code before adding a phone number', async () => {
    const { actor, fapi } = await renderSection(
      challenged({
        verification: {
          firstFactors: [
            { strategy: 'email_code', email_address_id: 'idn_email', safe_identifier: 'alice@example.com' },
          ],
          secrets: { email_code: VERIFICATION_CODE },
        },
      }),
    );
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await waitFor(() => expect(code).toHaveFocus());
    await waitFor(() => expect(fapi.verification.firstFactorVerification?.strategy).toBe('email_code'));
    await actor.keyboard(VERIFICATION_CODE);

    await screen.findByRole('dialog', { name: 'Verify your phone number' });
    await enterCode(actor, VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(listed()).toEqual([HOME_LABEL]);
  });

  it('closes quietly when confirmation is dismissed and starts clean on reopen', async () => {
    const { actor, fapi } = await renderSection(challenged());
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    await screen.findByPlaceholderText('Enter your password');
    await actor.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(savedPhones(fapi)).toHaveLength(0);
    await actor.click(screen.getByRole('button', { name: 'Add phone number' }));
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('');
    await actor.type(screen.getByRole('textbox', { name: 'Phone' }), '8015550199');
    await actor.click(screen.getByRole('button', { name: 'Send code' }));
    await enterCode(actor, VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(listed()).toEqual([WORK_LABEL]);
  });

  it('keeps an initial create pending through duplicate submit and dismissal attempts', async () => {
    const { actor } = await renderSection();
    const create = holdRequests('post', '/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    await waitFor(() => expect(create.requests).toHaveLength(1));
    await actor.keyboard('{Escape}{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(create.requests).toHaveLength(1);

    create.release();
    await enterCode(actor, VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(listed()).toEqual([HOME_LABEL]);
  });

  it('allows cancellation while the session challenge loads', async () => {
    const { actor, fapi } = await renderSection(challenged());
    const start = holdRequests('post', '/v1/client/sessions/sess_1/verify');
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    await waitFor(() => expect(start.requests).toHaveLength(1));
    await actor.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(savedPhones(fapi)).toHaveLength(0);
    start.release();
  });

  it('keeps the retried create locked and returns the phone field error without a duplicate', async () => {
    const { actor, fapi } = await renderSection(challenged());
    const retry = holdRequests('post', '/v1/me/phone_numbers');
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
    await waitFor(() => expect(retry.requests).toHaveLength(1));
    await actor.keyboard('{Escape}{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(retry.requests).toHaveLength(1);
    retry.fail('form_identifier_exists', 'That phone number is taken.', 'phone_number');

    const phone = await screen.findByRole('textbox', { name: 'Phone' });
    await waitFor(() => expect(phone).toHaveAccessibleDescription(/That phone number is taken/));
    expect(savedPhones(fapi)).toHaveLength(0);
  });

  it('focuses the phone field when returning to the form after verifying', async () => {
    const { actor } = await renderSection(challenged());
    const retry = holdRequests('post', '/v1/me/phone_numbers');
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
    await waitFor(() => expect(retry.requests).toHaveLength(1));
    retry.fail('form_identifier_exists', 'That phone number is taken.', 'phone_number');

    const phone = await screen.findByRole('textbox', { name: 'Phone' });
    await waitFor(() => expect(phone).toHaveFocus());
  });

  it('cancels an in-progress verification when the active session changes', async () => {
    const seed = challenged();
    const { actor, fapi, clerk } = await renderSection({
      ...seed,
      client: fapiClient([
        ...seed.client.sessions,
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', username: 'bob' }) }),
      ]),
    });
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    await screen.findByPlaceholderText('Enter your password');
    await act(() => clerk.setActive({ session: 'sess_2' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fapi.client.sessions.map(session => session.user.phone_numbers)).toEqual([[], []]);
  });

  it('closes the host from the challenge error card', async () => {
    const { actor, fapi } = await renderSection(challenged());
    holdRequests('post', '/v1/client/sessions/sess_1/verify').fail('some_new_error', 'Nope');
    demandReverificationOnce('/v1/me/phone_numbers');

    await addPhone(actor, '8015550100');
    expect(await screen.findByText('Something went wrong')).toBeVisible();
    const close = screen.getAllByRole('button', { name: 'Close' }).at(-1);
    if (!close) {
      throw new Error('Expected a close button');
    }
    await actor.click(close);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(savedPhones(fapi)).toHaveLength(0);
  });

  it('sets a verified number as primary without a challenge when none is required', async () => {
    const { actor, fapi } = await renderSection(signedIn([HOME, WORK]));

    await manage(actor, WORK_LABEL, 'Set as primary');

    await waitFor(() => expect(fapi.client.sessions[0]?.user?.primary_phone_number_id).toBe('idn_work'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('verifies the session before setting a number as primary and returns focus to its menu', async () => {
    const { actor, fapi } = await renderSection(
      signedIn([HOME, WORK], { verification: { secrets: { password: 'hunter2' } } }),
    );
    demandReverificationOnce('/v1/me');

    await manage(actor, WORK_LABEL, 'Set as primary');
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await actor.keyboard('hunter2{Enter}');

    await waitFor(() => expect(fapi.client.sessions[0]?.user?.primary_phone_number_id).toBe('idn_work'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(within(row()).getByRole('button', { name: `Manage ${WORK_LABEL}` })).toHaveFocus();
  });

  it('lets the user cancel verification quietly and retry the primary action', async () => {
    const { actor, fapi } = await renderSection(
      signedIn([HOME, WORK], { verification: { secrets: { password: 'hunter2' } } }),
    );
    demandReverificationOnce('/v1/me');

    await manage(actor, WORK_LABEL, 'Set as primary');
    await screen.findByText('Enter your current password to continue');
    const dialog = screen.getByRole('dialog');
    await actor.click(within(dialog).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user?.primary_phone_number_id).toBe('idn_home');
    expect(within(row()).queryByRole('alert')).toBeNull();
    expect(within(row()).getByRole('button', { name: `Manage ${WORK_LABEL}` })).toHaveFocus();

    await manage(actor, WORK_LABEL, 'Set as primary');
    await waitFor(() => expect(fapi.client.sessions[0]?.user?.primary_phone_number_id).toBe('idn_work'));
  });

  it('keeps the verification dialog open while retrying and reports an ordinary retry error', async () => {
    const { actor, fapi } = await renderSection(
      signedIn([HOME, WORK], { verification: { secrets: { password: 'hunter2' } } }),
    );
    demandReverificationOnce('/v1/me');

    await manage(actor, WORK_LABEL, 'Set as primary');
    await screen.findByText('Enter your current password to continue');
    const dialog = screen.getByRole('dialog');
    const replay = holdRequests('post', '/v1/me');
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await actor.keyboard('hunter2{Enter}');
    await waitFor(() => expect(replay.requests).toHaveLength(1));

    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    await actor.keyboard('{Escape}');
    expect(dialog).toBeVisible();
    expect(fapi.client.sessions[0]?.user?.primary_phone_number_id).toBe('idn_home');

    replay.fail('action_blocked', 'Unable to set primary number.');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(within(row()).getByRole('alert')).toHaveTextContent("This action couldn't be completed."),
    );
  });

  it('waits for a verification factor before opening the dialog', async () => {
    const { actor } = await renderSection(
      signedIn([HOME, WORK], { verification: { secrets: { password: 'hunter2' } } }),
    );
    demandReverificationOnce('/v1/me');
    const start = holdRequests('post', '/v1/client/sessions/:id/verify');

    await manage(actor, WORK_LABEL, 'Set as primary');
    await waitFor(() => expect(start.requests).toHaveLength(1));
    expect(screen.queryByRole('dialog')).toBeNull();

    start.release();
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
  });
});

describe('Removing a number', () => {
  it('verifies the session when the removal demands it, then removes the number', async () => {
    const { actor } = await renderSection(
      signedIn([HOME, WORK], { verification: { secrets: { password: 'hunter2' } } }),
    );
    demandReverificationOnce('/v1/me/phone_numbers/idn_work');

    await manage(actor, WORK_LABEL, 'Remove phone number');
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove phone number?' });
    await actor.click(within(dialog).getByRole('button', { name: 'Remove' }));

    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await actor.type(screen.getByLabelText('Password'), 'hunter2{Enter}');

    await waitFor(() => expect(listed()).toEqual([HOME_LABEL]));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
