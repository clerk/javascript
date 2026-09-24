import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Empty, Legacy, Proposed } from '../organization-profile-members-panel.stories';

it.each([Legacy, Proposed, Empty])('previews the table inside the Members panel (%#)', Story => {
  render(
    <MosaicProvider>
      <Story />
    </MosaicProvider>,
  );

  expect(screen.getByRole('heading', { name: 'Members' })).toBeVisible();
  expect(screen.getByRole('tablist', { name: 'Members' })).toBeVisible();
  expect(within(screen.getByRole('tabpanel')).getByRole('table')).toBeVisible();
});
