import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnterpriseAccount, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section';
import { github, google, renderSection, signedIn } from './user-profile-connected-accounts.fixtures';

async function openRemoval(user: ReturnType<typeof userEvent.setup>, provider: string) {
  await user.click(screen.getByRole('button', { name: `Manage ${provider}` }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
  return screen.getByRole('alertdialog');
}

describe('connected accounts', () => {
  it('removes the selected account and closes the confirmation', async () => {
    const { fapi } = await renderSection([google, github]);
    const request = holdRequests('post', '/v1/me/external_accounts/idn_github');
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'GitHub');

    expect(dialog).toHaveAccessibleName('Remove connected account');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(request.requests).toHaveLength(0);
    expect(fapi.client.sessions[0]?.user.external_accounts).toHaveLength(2);
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.release();

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage GitHub' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeVisible();
    expect(fapi.client.sessions[0]?.user.external_accounts.map(account => account.id)).toEqual(['idn_google']);
  });

  it('returns focus to the account menu when removal is canceled', async () => {
    await renderSection();
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Manage Google' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Remove' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('keeps removal pending until the request completes', async () => {
    const { fapi } = await renderSection([google, github]);
    const request = holdRequests('post', '/v1/me/external_accounts/idn_github');
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'GitHub');

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    expect(within(dialog).getByRole('button', { name: 'Remove' })).toHaveAttribute('aria-busy', 'true');
    expect(fapi.client.sessions[0]?.user.external_accounts).toHaveLength(2);

    request.release();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.external_accounts).toHaveLength(1);
  });

  it('keeps the confirmation open on a removal error and allows retrying', async () => {
    await renderSection([google]);
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google');
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'Google');

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('last_identification', 'You cannot remove your last sign-in method.');
    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent('You cannot remove your last sign-in method.'),
    );

    serveFapi(signedIn([google]));
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('keeps the confirmation open when removal needs reverification', async () => {
    await renderSection([google]);
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google');
    const dialog = await openRemoval(userEvent.setup(), 'Google');

    await userEvent.setup().click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('session_reverification_required', 'Verify your session.');
    expect(await within(dialog).findByText('Verify your session.')).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName('Remove connected account');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(dialog).queryByRole('textbox')).toBeNull();
    expect(within(dialog).queryByLabelText('Password')).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Remove' })).not.toHaveAttribute('aria-busy', 'true');
  });

  it('targets the account selected after canceling another removal', async () => {
    const { fapi } = await renderSection([google, github]);
    const user = userEvent.setup();

    const first = await openRemoval(user, 'Google');
    expect(first).toHaveAccessibleDescription(/Google will be removed/);
    await user.click(within(first).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    const second = await openRemoval(user, 'GitHub');
    expect(second).toHaveAccessibleDescription(/GitHub will be removed/);
    await user.click(within(second).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.external_accounts.map(account => account.id)).toEqual(['idn_google']);
  });

  it('focuses the next account and then Connect as accounts are removed', async () => {
    await renderSection([google, github]);
    const user = userEvent.setup();

    const first = await openRemoval(user, 'Google');
    await user.click(within(first).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage GitHub' })).toHaveFocus());

    const second = await openRemoval(user, 'GitHub');
    await user.click(within(second).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Connect GitHub' })).toHaveFocus());
  });

  it('restores the profile title after removing the final enterprise-restricted account', async () => {
    const environment = signedIn().environment;
    const { titleRef } = await renderSection([google], {
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({
            id: 'user_1',
            external_accounts: [google],
            enterprise_accounts: [fapiEnterpriseAccount({ id: 'sso_1' })],
          }),
        }),
      ]),
      environment: {
        ...environment,
        user_settings: {
          ...environment.user_settings,
          enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false },
        },
      },
    });
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'Google');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('group', { name: 'Connected accounts' })).toBeNull();
    await waitFor(() => expect(titleRef.current).toHaveFocus());
  });

  it.each(['switch', 'sign out'] as const)('closes a stale removal confirmation after %s', async change => {
    const fapi = serveFapi(
      signedIn([google], {
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: [google] }) }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', external_accounts: [github] }) }),
        ]),
      }),
    );
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />);
    const original = clerk.user?.externalAccounts[0];
    if (!original) {
      throw new Error('Expected original account');
    }
    const destroy = vi.spyOn(original, 'destroy');
    await openRemoval(userEvent.setup(), 'Google');
    await act(() => (change === 'switch' ? clerk.setActive({ session: 'sess_2' }) : clerk.signOut()));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(clerk.user?.id).toBe(change === 'switch' ? 'user_2' : undefined);
    expect(destroy).not.toHaveBeenCalled();
    if (change === 'switch') {
      expect(fapi.client.sessions[0]?.user.external_accounts).toEqual([google]);
      expect(fapi.client.sessions[1]?.user.external_accounts).toEqual([github]);
      expect(screen.getByRole('button', { name: 'Manage GitHub' })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('group', { name: 'Connected accounts' })).toBeNull();
    }
  });
});
