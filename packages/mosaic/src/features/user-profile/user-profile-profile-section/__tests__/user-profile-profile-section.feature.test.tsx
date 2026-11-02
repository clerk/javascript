import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  demandReverificationOnce,
  type FakeFapiSeed,
  fapiUrl,
  holdRequests,
  serveFapi,
  worker,
} from '../../../../__tests__/feature/fake-fapi';
import type { FapiAttributeOverrides } from '../../../../__tests__/feature/fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiSession,
  fapiUser,
} from '../../../../__tests__/feature/fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileProfileSection } from '../user-profile-profile-section';

function signedIn(environment = fapiEnvironment()): FakeFapiSeed {
  const user = fapiUser({
    id: 'user_1',
    first_name: 'Alice',
    last_name: 'Smith',
    email_addresses: [fapiEmailAddress({ id: 'idn_email' })],
  });
  return { environment, client: fapiClient([fapiSession({ id: 'sess_1', user })]) };
}

async function renderSection(seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<UserProfileProfileSection />);
  return { ...view, fapi, actor: userEvent.setup() };
}

function fileInput(container: Element): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('expected a file input');
  }
  return input;
}

const oversized = () => new File([new Uint8Array(10 * 1000 * 1000 + 1)], 'big.png', { type: 'image/png' });

function withUsername(username: string | null, attribute: FapiAttributeOverrides['username'] = {}): FakeFapiSeed {
  const user = fapiUser({ id: 'user_1', username, email_addresses: [fapiEmailAddress({ id: 'idn_email' })] });
  return {
    environment: fapiEnvironment({ attributes: { username: attribute } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user })]),
  };
}

const profile = () => screen.getByRole('group', { name: 'Profile' });

function failsWith(path: string, error: Record<string, unknown>, status: number) {
  worker.use(http.post(fapiUrl(path), () => HttpResponse.json({ errors: [error] }, { status })));
}

describe('the user profile profile section', () => {
  it('names the section and shows the full name', async () => {
    await renderSection();

    expect(within(screen.getByRole('group', { name: 'Profile' })).getByText('Alice Smith')).toBeInTheDocument();
  });

  it('saves an edited name and closes the dialog', async () => {
    const { actor } = await renderSection();

    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.clear(within(dialog).getByLabelText('First name'));
    await actor.type(within(dialog).getByLabelText('First name'), 'Alicia');
    await actor.clear(within(dialog).getByLabelText('Last name'));
    await actor.type(within(dialog).getByLabelText('Last name'), 'Jones');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Alicia Jones')).toBeInTheDocument();
  });

  it('puts a last name the server rejects on the last name field', async () => {
    const { actor } = await renderSection();
    failsWith(
      '/v1/me',
      {
        code: 'form_param_format_invalid',
        message: 'Invalid',
        long_message: 'Last name contains invalid characters.',
        meta: { param_name: 'last_name' },
      },
      422,
    );

    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.type(within(dialog).getByLabelText('Last name'), '!');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    const lastName = within(dialog).getByLabelText('Last name');
    await waitFor(() => expect(lastName).toHaveAccessibleDescription('Last name contains invalid characters.'));
    expect(lastName).toHaveAttribute('aria-invalid', 'true');
    expect(within(dialog).getByLabelText('First name')).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps Save disabled while a required half of the name is empty', async () => {
    const { actor } = await renderSection(
      signedIn(fapiEnvironment({ attributes: { first_name: { required: true }, last_name: { required: true } } })),
    );

    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    const save = within(dialog).getByRole('button', { name: 'Save changes' });
    await actor.clear(within(dialog).getByLabelText(/^First name/));
    expect(save).toHaveAttribute('aria-disabled', 'true');
    await actor.type(within(dialog).getByLabelText(/^First name/), 'Alicia');
    await actor.clear(within(dialog).getByLabelText(/^Last name/));
    expect(save).toHaveAttribute('aria-disabled', 'true');
    await actor.type(within(dialog).getByLabelText(/^Last name/), 'Jones');
    expect(save).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('leaves the name out when the instance collects neither half of it', async () => {
    await renderSection(
      signedIn(fapiEnvironment({ attributes: { first_name: { enabled: false }, last_name: { enabled: false } } })),
    );

    expect(screen.getByRole('group', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
  });

  it('uploads a picked picture and then offers to change or remove it', async () => {
    const { actor, container } = await renderSection();

    expect(screen.queryByRole('button', { name: 'Manage profile picture' })).not.toBeInTheDocument();
    await actor.upload(fileInput(container), new File(['x'], 'me.png', { type: 'image/png' }));

    await openMenu(actor, await screen.findByRole('button', { name: 'Manage profile picture' }));
    expect(screen.getByRole('menuitem', { name: 'Remove avatar' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Change avatar' }).querySelector('svg')).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Remove avatar' }).querySelector('svg')).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Remove avatar' })).toHaveAttribute('data-color', 'negative');
  });

  it('says why an upload was refused', async () => {
    const { actor, container } = await renderSection();
    failsWith('/v1/me/profile_image', { code: 'avatar_file_size_exceeded', message: 'Too large' }, 413);

    await actor.upload(fileInput(container), new File(['x'], 'me.png', { type: 'image/png' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
      ),
    );
  });

  it('turns away a file past the size the row advertises without uploading it', async () => {
    const { actor, container } = await renderSection();
    const upload = holdRequests('post', '/v1/me/profile_image');

    await actor.upload(fileInput(container), oversized());

    expect(screen.getByRole('alert')).toHaveTextContent('File size exceeds the maximum limit of 10MB.');
    expect(upload.requests).toHaveLength(0);
    upload.release();
  });

  it('clears the rejection once an acceptable file is picked', async () => {
    const { actor, container } = await renderSection();

    await actor.upload(fileInput(container), oversized());
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await actor.upload(fileInput(container), new File(['x'], 'me.png', { type: 'image/png' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('replaces a rejected pick with why removing the picture failed', async () => {
    const { actor, container } = await renderSection();
    await actor.upload(fileInput(container), new File(['x'], 'me.png', { type: 'image/png' }));
    await screen.findByRole('button', { name: 'Manage profile picture' });
    await waitFor(() => expect(fileInput(container)).toBeEnabled());

    await actor.upload(fileInput(container), oversized());
    expect(screen.getByRole('alert')).toHaveTextContent('File size exceeds the maximum limit of 10MB.');

    failsWith('/v1/me/profile_image', { code: 'action_blocked', message: 'Blocked' }, 403);
    await openMenu(actor, screen.getByRole('button', { name: 'Manage profile picture' }));
    await actor.click(screen.getByRole('menuitem', { name: 'Remove avatar' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent("This action couldn't be completed."));
  });

  it('hands the name to an active enterprise connection instead of offering to edit it', async () => {
    const user = fapiUser({
      id: 'user_1',
      first_name: 'Alice',
      last_name: 'Smith',
      email_addresses: [fapiEmailAddress({ id: 'idn_primary', email_address: 'alice@acme.co' })],
      enterprise_accounts: [
        fapiEnterpriseAccount({ id: 'eac_1', email_address: 'alice@acme.co' }, { name: 'Acme Corp' }),
      ],
    });
    await renderSection({
      environment: fapiEnvironment({
        user_settings: {
          enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user })]),
    });

    expect(await screen.findByText('Managed by Acme Corp')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
  });

  it('shows the newly active account and drops the draft the other one left open', async () => {
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
    const { actor, clerk } = await renderSection({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice }), fapiSession({ id: 'sess_2', user: bob })]),
    });

    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.clear(within(dialog).getByLabelText('First name'));
    await actor.type(within(dialog).getByLabelText('First name'), 'Alicia');

    await act(() => clerk.setActive({ session: 'sess_2' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText(/Alic/)).not.toBeInTheDocument();
  });

  it('shows the username and saves an edited one', async () => {
    const { actor } = await renderSection(withUsername('alicesmith'));
    expect(profile()).toHaveTextContent('alicesmith');

    await actor.click(within(profile()).getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    await actor.clear(within(dialog).getByLabelText('Username'));
    await actor.type(within(dialog).getByLabelText('Username'), 'alicia');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(profile()).toHaveTextContent('alicia');
  });

  it('keeps Save disabled while a required username is empty', async () => {
    const { actor } = await renderSection(withUsername('alicesmith', { required: true }));

    await actor.click(within(profile()).getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    await actor.clear(within(dialog).getByLabelText(/^Username/));

    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('tells the user the username length the instance allows', async () => {
    const { actor } = await renderSection({
      ...withUsername('alicesmith'),
      environment: fapiEnvironment({ user_settings: { username_settings: { min_length: 5, max_length: 20 } } }),
    });
    failsWith(
      '/v1/me',
      { code: 'form_username_invalid_length', message: 'Invalid length', meta: { param_name: 'username' } },
      422,
    );

    await actor.click(within(profile()).getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    await actor.type(within(dialog).getByLabelText('Username'), '2');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(within(dialog).getByLabelText('Username')).toHaveAccessibleDescription(
        'Your username must be between 5 and 20 characters long.',
      ),
    );
  });

  it('offers to set a username the user has not picked yet', async () => {
    await renderSection(withUsername(null));

    expect(within(profile()).getByRole('button', { name: 'Add username' })).toBeInTheDocument();
  });

  it('keeps the username dialog open on the error the server names it for', async () => {
    const { actor } = await renderSection(withUsername('alicesmith'));
    worker.use(
      http.post(fapiUrl('/v1/me'), () =>
        HttpResponse.json(
          {
            errors: [
              {
                code: 'form_identifier_exists',
                message: 'Taken',
                long_message: 'That username is taken. Please try another.',
                meta: { param_name: 'username' },
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );

    await actor.click(screen.getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    await actor.type(within(dialog).getByLabelText('Username'), '2');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByText('That username is taken. Please try another.')).toBeInTheDocument();
  });

  it('leaves the username out when the instance does not collect it', async () => {
    await renderSection(withUsername('alicesmith', { enabled: false }));

    expect(within(profile()).queryByText('Username')).not.toBeInTheDocument();
  });

  it('shows an immutable username without offering to change it', async () => {
    await renderSection(withUsername('alicesmith', { immutable: true }));

    expect(profile()).toHaveTextContent('alicesmith');
    expect(screen.queryByRole('button', { name: 'Edit username' })).not.toBeInTheDocument();
  });

  it('leaves the username out when it is immutable and was never set', async () => {
    await renderSection(withUsername(null, { immutable: true }));

    expect(within(profile()).queryByText('Username')).not.toBeInTheDocument();
  });
});

describe('username reverification', () => {
  async function renderUsernameNeedingReverification(prepare?: () => void): Promise<{
    fapi: ReturnType<typeof serveFapi>;
    actor: ReturnType<typeof userEvent.setup>;
  }> {
    const fapi = serveFapi({
      ...withUsername('alicesmith'),
      verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' }] },
    });
    prepare?.();
    demandReverificationOnce('/v1/me');
    await renderWithClerk(<UserProfileProfileSection />);
    const actor = userEvent.setup();
    await actor.click(within(profile()).getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    await actor.clear(within(dialog).getByLabelText('Username'));
    await actor.type(within(dialog).getByLabelText('Username'), 'alicia');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    return { fapi, actor };
  }

  const savedUsername = (fapi: ReturnType<typeof serveFapi>): string | null | undefined =>
    fapi.client.sessions[0]?.user?.username;

  it('asks to verify before saving the username, then saves it', async () => {
    const { fapi, actor } = await renderUsernameNeedingReverification();

    const field = await screen.findByPlaceholderText('Enter your password');
    expect(savedUsername(fapi)).toBe('alicesmith');
    await actor.type(field, 'hunter2{Enter}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(savedUsername(fapi)).toBe('alicia');
    expect(profile()).toHaveTextContent('alicia');
  });

  it('closes without saving when verification is dismissed, and reopens on the saved username', async () => {
    const { fapi, actor } = await renderUsernameNeedingReverification();

    await screen.findByPlaceholderText('Enter your password');
    await actor.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(savedUsername(fapi)).toBe('alicesmith');
    await actor.click(within(profile()).getByRole('button', { name: 'Edit username' }));
    expect(screen.getByLabelText('Username')).toHaveValue('alicesmith');
  });

  it('allows correcting and saving the username after a field error following verification', async () => {
    const updates: Array<ReturnType<typeof holdRequests>> = [];
    let handlers: ReturnType<typeof worker.listHandlers> = [];
    const { fapi, actor } = await renderUsernameNeedingReverification(() => {
      handlers = worker.listHandlers();
      updates.push(holdRequests('post', '/v1/me'));
    });
    const update = updates[0];

    await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
    await waitFor(() => expect(update.requests).toHaveLength(1));
    update.fail('form_identifier_exists', 'That username is taken. Please try another.', 'username');

    const field = await screen.findByLabelText('Username');
    expect(field).toHaveValue('alicia');
    await waitFor(() => expect(field).toHaveAccessibleDescription(/That username is taken/));
    expect(savedUsername(fapi)).toBe('alicesmith');

    worker.resetHandlers(...handlers);
    await actor.clear(field);
    await actor.type(field, 'alicia2');
    await actor.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(profile()).toHaveTextContent('alicia2');
    expect(savedUsername(fapi)).toBe('alicia2');
  });

  it('focuses the username field when returning to the form after verifying', async () => {
    const updates: Array<ReturnType<typeof holdRequests>> = [];
    const { actor } = await renderUsernameNeedingReverification(() => {
      updates.push(holdRequests('post', '/v1/me'));
    });
    const update = updates[0];

    await actor.type(await screen.findByPlaceholderText('Enter your password'), 'hunter2{Enter}');
    await waitFor(() => expect(update.requests).toHaveLength(1));
    update.fail('form_identifier_exists', 'That username is taken. Please try another.', 'username');

    const field = await screen.findByLabelText('Username');
    await waitFor(() => expect(field).toHaveFocus());
  });

  it('closes the dialog from the verification error card', async () => {
    const { fapi, actor } = await renderUsernameNeedingReverification(() =>
      holdRequests('post', '/v1/client/sessions/sess_1/verify').fail('some_new_error', 'Nope'),
    );

    expect(await screen.findByText('Something went wrong')).toBeVisible();
    const buttons = screen.getAllByRole('button', { name: 'Close' });
    await actor.click(buttons[buttons.length - 1]);

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(savedUsername(fapi)).toBe('alicesmith');
  });

  it('cancels an in-progress username verification when the active session changes', async () => {
    const fapi = serveFapi({
      environment: fapiEnvironment({ attributes: { username: {} } }),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', username: 'alicesmith' }) }),
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', username: 'bob' }) }),
      ]),
      verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' }] },
    });
    demandReverificationOnce('/v1/me');
    const { clerk } = await renderWithClerk(<UserProfileProfileSection />);
    const actor = userEvent.setup();
    await actor.click(within(profile()).getByRole('button', { name: 'Edit username' }));
    await actor.clear(screen.getByLabelText('Username'));
    await actor.type(screen.getByLabelText('Username'), 'alicia');
    await actor.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByPlaceholderText('Enter your password');

    await act(() => clerk.setActive({ session: 'sess_2' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.client.sessions.map(session => session.user.username)).toEqual(['alicesmith', 'bob']);
  });
});
