import type { PhoneNumberJSON } from '@clerk/shared/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, fapiUrl, serveFapi, VERIFICATION_CODE, worker } from '../../../__tests__/feature/fake-fapi';
import type { FapiAttributeOverrides } from '../../../__tests__/feature/fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileAccountSection } from '../user-profile-account-section/user-profile-account-section';

const HOME = fapiPhoneNumber({ id: 'idn_home', phone_number: '+18015550100', verification: fapiVerification() });
const WORK = fapiPhoneNumber({ id: 'idn_work', phone_number: '+18015550199', verification: fapiVerification() });
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
  await actor.click(await screen.findByRole('textbox', { name: 'Verification code' }));
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

    expect(screen.getByRole('button', { name: /Didn’t receive a code\? Resend \(\d+\)/ })).toBeDisabled();
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

describe('reverification', () => {
  it.todo('confirms it is the user before an email address is added, then adds it');
  it.todo('confirms it is the user before an email address becomes the primary one');
  it.todo('confirms it is the user before a phone number is added, then adds it');
  it.todo('confirms it is the user before a phone number becomes the primary one');
  it.todo('confirms it is the user before the username changes');
  it.todo('leaves the add dialog open and untouched when the confirmation is dismissed');
});
