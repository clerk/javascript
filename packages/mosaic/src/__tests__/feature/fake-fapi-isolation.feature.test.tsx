import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from './fake-fapi';
import { fapiClient, fapiSession, fapiUser } from './fapi';
import { renderWithClerk } from './render';

describe('fake FAPI isolation between tests', () => {
  // eslint-disable-next-line vitest/expect-expect -- Leaves work running for the next test, which asserts it is isolated.
  it('leaves a request in flight when the test ends', async () => {
    const user = fapiUser({ id: 'user_1' });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    const { clerk } = await renderWithClerk(<div />);
    void clerk.user?.getOrganizationMemberships().catch(() => undefined);
  });

  it('does not hand the previous test’s request to this test’s handlers', async () => {
    serveFapi();
    const memberships = holdRequests('get', '/v1/me/organization_memberships');
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(memberships.requests).toHaveLength(0);
    memberships.release();
  });

  // eslint-disable-next-line vitest/expect-expect -- Leaves work running for the next test, which asserts it is isolated.
  it('starts a request after the test ends', async () => {
    const user = fapiUser({ id: 'user_1' });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    const { clerk } = await renderWithClerk(<div />);
    setTimeout(() => void clerk.user?.getOrganizationMemberships().catch(() => undefined), 50);
  });

  it('does not let the previous test’s Clerk reach this test’s handlers', async () => {
    serveFapi();
    const memberships = holdRequests('get', '/v1/me/organization_memberships');
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(memberships.requests).toHaveLength(0);
    memberships.release();
  });
});
