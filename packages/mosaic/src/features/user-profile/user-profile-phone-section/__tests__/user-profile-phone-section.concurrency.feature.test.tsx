import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Activity } from 'react';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi, VERIFICATION_CODE } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfilePhoneSection } from '../user-profile-phone-section';

function signedIn() {
  const user = fapiUser({ id: 'user_1', first_name: 'Alice', username: 'alicesmith', phone_numbers: [] });
  return {
    environment: fapiEnvironment({ attributes: { phone_number: { enabled: true } } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user })]),
  };
}

function inActivity(mode: 'visible' | 'hidden') {
  return (
    <Activity mode={mode}>
      <UserProfilePhoneSection />
    </Activity>
  );
}

async function verify(actor: ReturnType<typeof userEvent.setup>) {
  const code = await screen.findByRole('textbox', { name: 'Verification code' });
  await waitFor(() => expect(code).not.toHaveAttribute('aria-disabled'));
  await actor.click(code);
  await actor.keyboard(VERIFICATION_CODE);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('group', { name: 'Phone' })).toHaveTextContent('+1 (801) 555-0100');
  expect(screen.getByRole('group', { name: 'Phone' })).not.toHaveTextContent('Unverified');
}

describe.runIf(Activity)('the user profile phone section inside Activity', () => {
  it('keeps the code step after being hidden and shown again', async () => {
    serveFapi(signedIn());
    const view = await renderWithClerk(inActivity('visible'));
    const actor = userEvent.setup();

    await actor.click(screen.getByRole('button', { name: 'Add phone number' }));
    await actor.type(screen.getByRole('textbox', { name: 'Phone' }), '8015550100');
    await actor.click(screen.getByRole('button', { name: 'Send code' }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await waitFor(() => expect(code).not.toHaveAttribute('aria-disabled'));

    act(() => view.rerender(inActivity('hidden')));
    act(() => view.rerender(inActivity('visible')));

    expect(screen.getByRole('dialog')).toBeVisible();
    await verify(actor);
  });

  it('keeps waiting for a code that was in flight when hidden', async () => {
    serveFapi(signedIn());
    const view = await renderWithClerk(inActivity('visible'));
    const actor = userEvent.setup();
    const prepare = holdRequests('post', '/v1/me/phone_numbers/:id/prepare_verification');

    await actor.click(screen.getByRole('button', { name: 'Add phone number' }));
    await actor.type(screen.getByRole('textbox', { name: 'Phone' }), '8015550100');
    await actor.click(screen.getByRole('button', { name: 'Send code' }));
    await waitFor(() => expect(prepare.requests).toHaveLength(1));

    act(() => view.rerender(inActivity('hidden')));
    prepare.release();
    act(() => view.rerender(inActivity('visible')));

    expect(prepare.requests).toHaveLength(1);
    await verify(actor);
  });
});
