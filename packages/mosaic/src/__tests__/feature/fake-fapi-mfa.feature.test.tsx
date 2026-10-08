import { describe, expect, it } from 'vitest';

import { fapiUrl, serveFapi } from './fake-fapi';
import { fapiClient, fapiPhoneNumber, fapiSession, fapiUser } from './fapi';

describe('fake FAPI MFA session routing', () => {
  it('updates the requested user across their sessions without changing the active user', async () => {
    const requestedUser = fapiUser({
      id: 'user_2',
      phone_numbers: [fapiPhoneNumber({ id: 'phone_2', phone_number: '+15555550202' })],
    });
    const fapi = serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) }),
        fapiSession({ id: 'sess_2', user: requestedUser }),
        fapiSession({ id: 'sess_3', user: requestedUser }),
      ]),
    });
    const response = await fetch(`${fapiUrl('/v1/me/phone_numbers/phone_2')}?_method=PATCH&_clerk_session_id=sess_2`, {
      method: 'POST',
      body: new URLSearchParams({ reserved_for_second_factor: 'true' }),
    });

    expect(response.ok).toBe(true);
    expect(fapi.client.sessions[0]?.user.phone_numbers).toHaveLength(0);
    for (const session of fapi.client.sessions.slice(1)) {
      expect(session.user.phone_numbers[0]?.reserved_for_second_factor).toBe(true);
      expect(session.user.two_factor_enabled).toBe(true);
    }
  });
});
