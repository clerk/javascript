import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Default, Overlay } from '../organization-profile.stories';

describe('organization profile members tab', () => {
  it.each([Default, Overlay])('renders members inside the members panel (%#)', async Story => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Story />
      </MosaicProvider>,
    );
    if (Story === Overlay) {
      await user.click(screen.getByRole('button', { name: 'Manage workspace' }));
    }

    await user.click(screen.getByRole('tab', { name: 'Members' }));
    const tabs = screen.getByRole('tablist', { name: 'Members' });
    await user.click(within(tabs).getByRole('tab', { name: 'Members' }));
    const table = screen.getByRole('table', { name: 'Members' });
    expect(table).toBeVisible();
    expect(within(table).getByText('ada.lovelace@example.com')).toBeVisible();
  });
});
