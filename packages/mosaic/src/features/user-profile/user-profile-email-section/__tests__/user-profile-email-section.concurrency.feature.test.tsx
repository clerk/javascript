import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Activity } from 'react';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi, VERIFICATION_CODE } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileEmailSection } from '../user-profile-email-section';

function signedIn() {
  const user = fapiUser({ id: 'user_1', first_name: 'Alice', username: 'alicesmith', email_addresses: [] });
  return { client: fapiClient([fapiSession({ id: 'sess_1', user })]) };
}

function inActivity(mode: 'visible' | 'hidden') {
  return (
    <Activity mode={mode}>
      <UserProfileEmailSection />
    </Activity>
  );
}

describe.runIf(Activity)('the user profile email section inside Activity', () => {
  it('keeps the code step after being hidden and shown again', async () => {
    serveFapi(signedIn());
    const view = await renderWithClerk(inActivity('visible'));
    const actor = userEvent.setup();

    await actor.click(screen.getByRole('button', { name: 'Add email' }));
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
    await actor.click(screen.getByRole('button', { name: 'Continue' }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await waitFor(() => expect(code).not.toHaveAttribute('aria-disabled'));

    act(() => view.rerender(inActivity('hidden')));
    act(() => view.rerender(inActivity('visible')));

    expect(screen.getByRole('dialog')).toBeVisible();
    await actor.click(screen.getByRole('textbox', { name: 'Verification code' }));
    await actor.keyboard(VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('group', { name: 'Email' })).toHaveTextContent('new@example.com');
    expect(screen.getByRole('group', { name: 'Email' })).not.toHaveTextContent('Unverified');
  });

  it('keeps waiting for a code that was in flight when hidden', async () => {
    serveFapi(signedIn());
    const view = await renderWithClerk(inActivity('visible'));
    const actor = userEvent.setup();
    const prepare = holdRequests('post', '/v1/me/email_addresses/:id/prepare_verification');

    await actor.click(screen.getByRole('button', { name: 'Add email' }));
    await actor.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
    await actor.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(prepare.requests).toHaveLength(1));

    act(() => view.rerender(inActivity('hidden')));
    prepare.release();
    act(() => view.rerender(inActivity('visible')));

    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await waitFor(() => expect(code).not.toHaveAttribute('aria-disabled'));
    await actor.click(code);
    await actor.keyboard(VERIFICATION_CODE);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
