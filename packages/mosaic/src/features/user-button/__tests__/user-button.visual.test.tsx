import { describe, expect, it } from 'vitest';

import { fapiEmailAddress, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { openSwitcher, serveSwitcherFixture } from '../../switcher/__tests__/switcher.visual.fixtures';
import { UserButton } from '../user-button';

describe('UserButton visual state', () => {
  it('shows the combined account and organization menu open', async () => {
    const bob = fapiUser({
      id: 'user_bob',
      first_name: 'Bob',
      last_name: 'Morgan',
      email_addresses: [fapiEmailAddress({ id: 'email_bob', email_address: 'bob@example.com' })],
    });
    serveSwitcherFixture({ otherSessions: [fapiSession({ id: 'session_bob', user: bob })] });
    await renderWithClerk(<UserButton mode='combined' />);
    const popup = await openSwitcher(/Open account menu/);

    await expect(popup).toMatchScreenshot('user-button-combined-open');
  });
});
