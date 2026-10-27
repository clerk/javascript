import { describe, expect, it } from 'vitest';

import { renderWithClerk } from '../../../__tests__/feature/render';
import { openSwitcher, serveSwitcherFixture } from '../../switcher/__tests__/switcher.visual.fixtures';
import { OrganizationSwitcher } from '../organization-switcher';

describe('OrganizationSwitcher visual state', () => {
  it('shows the organization menu open', async () => {
    serveSwitcherFixture();
    await renderWithClerk(<OrganizationSwitcher />);
    const popup = await openSwitcher(/Open organization menu/);

    await expect(popup).toMatchScreenshot('organization-switcher-open');
  });
});
