import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Default, Overlay } from '../organization-profile.stories';

describe('organization profile', () => {
  it.each([Default, Overlay])('manages API keys from the profile (%#)', async Story => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Story />
      </MosaicProvider>,
    );
    if (Story === Overlay) {
      await user.click(screen.getByRole('button', { name: 'Manage workspace' }));
    }

    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
    expect(screen.getByRole('table', { name: 'API Keys' })).toBeVisible();
    expect(within(screen.getByRole('table', { name: 'API Keys' })).getByText('Web app')).toBeVisible();

    const create = screen.getByRole('button', { name: 'Create API key' });
    await user.click(create);
    await user.type(screen.getByRole('textbox', { name: 'Secret key name' }), 'Profile integration');
    await user.click(screen.getByRole('combobox', { name: /^Expiration/ }));
    await user.click(screen.getByRole('option', { name: 'Never' }));
    await user.click(screen.getByRole('button', { name: 'Add API Key' }));

    const dialog = await screen.findByRole('dialog', { name: 'Copy your API Key' });
    await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Copy your API Key' })).not.toBeInTheDocument());
    await expect(navigator.clipboard.readText()).resolves.toMatch(/^ak_demo_/);
    expect(create).toHaveFocus();

    await user.click(screen.getByRole('tab', { name: 'General' }));
    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
    await user.type(screen.getByRole('searchbox'), 'Profile integration');
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(2));
    expect(within(screen.getByRole('table', { name: 'API Keys' })).getByText('Profile integration')).toBeVisible();
  });
});
