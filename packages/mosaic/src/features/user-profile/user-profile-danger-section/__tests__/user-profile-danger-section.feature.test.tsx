import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { openDialog } from '../../../../__tests__/feature/dialog';
import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileDangerSection } from '../user-profile-danger-section';

const alice = fapiUser({ id: 'user_1', first_name: 'Alice' });
const bob = fapiUser({ id: 'user_2', first_name: 'Bob' });

type User = ReturnType<typeof userEvent.setup>;

function signedIn(sessions = [fapiSession({ id: 'sess_1', user: alice })]) {
  return { client: fapiClient(sessions) } satisfies FakeFapiSeed;
}

async function renderSection(seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<UserProfileDangerSection />, { afterSignOutUrl: '/signed-out' });
  return { ...view, fapi };
}

async function openDelete(user: User) {
  return openDialog(user, await screen.findByRole('button', { name: 'Delete account' }), { role: 'alertdialog' });
}

async function confirm(user: User, dialog: HTMLElement, phrase = 'Delete account') {
  await user.type(within(dialog).getByRole('textbox'), phrase);
  await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));
}

const signedInUsers = (fapi: FakeFapiSeed) => fapi.client?.sessions.map(session => session.user.id);

describe('UserProfileDangerSection', () => {
  it('renders the fallback until Clerk has loaded the user', async () => {
    serveFapi(signedIn());
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(<UserProfileDangerSection fallback={<p>Loading account</p>} />);

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByText('Loading account')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Danger zone' })).toBeNull();

    client.release();
    await rendering;
    expect(await screen.findByRole('heading', { name: 'Danger zone' })).toBeVisible();
    expect(screen.queryByText('Loading account')).toBeNull();
  });

  it('renders nothing when the user may not delete their account', async () => {
    const { container } = await renderSection(
      signedIn([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', delete_self_enabled: false }) })]),
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the danger zone and opens the dialog from the action', async () => {
    await renderSection();
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'Danger zone' })).toBeVisible();
    expect(screen.getByText('Delete account', { selector: '.cl-section-label > *' })).toBeInTheDocument();
    expect(screen.getByText('Permanently delete this account and all its data. This cannot be undone.')).toHaveClass(
      'cl-section-description',
    );
    expect(screen.queryByRole('alertdialog')).toBeNull();

    const dialog = await openDelete(user);
    expect(within(dialog).getByText('Type “Delete account” below to continue')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Delete account' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('deletes the account only after the phrase is typed, then sends the user to the after-sign-out url', async () => {
    const { fapi, navigate } = await renderSection();
    const user = userEvent.setup();
    const dialog = await openDelete(user);

    await confirm(user, dialog, 'Delete accoun');
    expect(within(dialog).getByRole('button', { name: 'Delete account' })).toHaveAttribute('aria-disabled', 'true');
    expect(signedInUsers(fapi)).toEqual(['user_1']);

    await confirm(user, dialog, 't');

    await waitFor(() => expect(signedInUsers(fapi)).toEqual([]));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/signed-out'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('sends the user to the single-session sign-out url when another account is still signed in', async () => {
    const { fapi, navigate } = await renderSection(
      signedIn([fapiSession({ id: 'sess_1', user: alice }), fapiSession({ id: 'sess_2', user: bob })]),
    );
    const user = userEvent.setup();
    const dialog = await openDelete(user);

    await confirm(user, dialog);

    await waitFor(() => expect(signedInUsers(fapi)).toEqual(['user_2']));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/after-single-sign-out'));
  });

  it('keeps the dialog open with the Clerk error when the delete fails', async () => {
    const { fapi, navigate } = await renderSection();
    const user = userEvent.setup();
    const dialog = await openDelete(user);
    const destroy = holdRequests('post', '/v1/me', { _method: 'DELETE' });

    await confirm(user, dialog);
    destroy.fail('subscription_active', 'Your subscription is still active.');

    expect(await within(dialog).findByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeVisible();
    expect(signedInUsers(fapi)).toEqual(['user_1']);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('holds the dialog open while the delete is in flight', async () => {
    await renderSection();
    const user = userEvent.setup();
    const dialog = await openDelete(user);
    const destroy = holdRequests('post', '/v1/me', { _method: 'DELETE' });

    await confirm(user, dialog);

    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Delete account' })).toHaveAttribute('aria-busy', 'true'),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('alertdialog')).toBeVisible();

    destroy.release();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('clears the phrase when the dialog is cancelled', async () => {
    const { fapi } = await renderSection();
    const user = userEvent.setup();
    const dialog = await openDelete(user);

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    const reopened = await openDelete(user);
    expect(within(reopened).getByRole('textbox')).toHaveValue('');
    expect(signedInUsers(fapi)).toEqual(['user_1']);
  });
});
