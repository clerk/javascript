import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { tick } from '../../../../__tests__/async';
import { holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileMfaSection } from '../user-profile-mfa-section';
import { mfaEnvironment, phone } from './mfa-feature-setup';

describe('MFA account changes', () => {
  it('does not send a verification code after a pending phone creation changes accounts', async () => {
    const fapi = serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', phone_numbers: [phone] }) }),
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileMfaSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Add a new phone number' }));
    await user.type(await screen.findByRole('textbox', { name: 'Phone' }), '5555550303');
    const creation = holdRequests('post', '/v1/me/phone_numbers/');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    await act(() => clerk.setActive({ session: 'sess_2' }));
    creation.release();
    await waitFor(() => expect(fapi.mfa.phoneCreations).toHaveLength(1));
    await act(tick);
    expect(fapi.mfa.phonePreparations).toEqual([]);
    expect(screen.queryByRole('textbox', { name: 'Verification code' })).toBeNull();
    expect(clerk.session?.id).toBe('sess_2');
  });
});
