import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Default as FullProfile, Overlay } from '../user-profile.stories';
import { Default, ProposedTable } from '../user-profile-api-keys-panel.stories';

describe('API keys playground', () => {
  it('formats existing key dates and relative times with the active locale', () => {
    const view = render(
      <MosaicProvider localization={{ locale: 'fr-FR' }}>
        <Default />
      </MosaicProvider>,
    );
    expect(screen.getByRole('cell', { name: '5 janv. 2026' })).toBeVisible();
    expect(screen.getAllByText('Expires 31 déc. 2027')[0]).toBeVisible();
    expect(screen.getByRole('cell', { name: 'il y a 2 minutes' })).toBeVisible();
    view.rerender(
      <MosaicProvider localization={{ locale: 'en-US' }}>
        <Default />
      </MosaicProvider>,
    );
    expect(screen.getByRole('cell', { name: 'Jan 5, 2026' })).toBeVisible();
    expect(screen.getAllByText('Expires Dec 31, 2027')[0]).toBeVisible();
    expect(screen.getByRole('cell', { name: '2 minutes ago' })).toBeVisible();
  });

  it('creates and copies a key, then resets the form for the next key', async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(
      <MosaicProvider>
        <Default />
      </MosaicProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Create API key' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Add new API key' });
    expect(within(dialog).getByLabelText('Secret key name')).toHaveFocus();
    expect(within(dialog).queryByText('This key will never expire')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: 'Expiration Select expiration' })).toHaveTextContent(
      'Select expiration',
    );
    expect(within(dialog).queryByText('Optional')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: /^Expiration/ })).toHaveAttribute('aria-required', 'true');
    await user.type(within(dialog).getByLabelText('Secret key name'), 'New integration');
    expect(within(dialog).getByRole('button', { name: 'Add API Key' })).toBeDisabled();
    await user.keyboard('{Enter}');
    expect(within(dialog).getByRole('button', { name: 'Add API Key' })).toBeDisabled();
    await user.click(within(dialog).getByRole('combobox', { name: /^Expiration/ }));
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'Never',
      '1 Day',
      '7 Days',
      '30 Days',
      '60 Days',
      '90 Days',
      '180 Days',
      '1 Year',
    ]);
    await user.click(screen.getByRole('option', { name: 'Never' }));
    expect(within(dialog).getByText('This key will never expire')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Add API Key' })).toBeEnabled();
    await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
    const copyDialog = await screen.findByRole('dialog', { name: 'Copy your API Key' });
    await waitFor(() => expect(within(copyDialog).getByRole('button', { name: 'Copy API key' })).toHaveFocus());
    const secretInput = within(copyDialog).getByRole('textbox', { name: 'API key' });
    expect(secretInput).toHaveAttribute('readonly');
    const secret = secretInput.getAttribute('value');
    expect(secret).toMatch(/^ak_demo_/);
    await user.click(secretInput);
    expect(secretInput).toHaveFocus();
    expect(within(copyDialog).queryByLabelText('Secret key name')).not.toBeInTheDocument();
    await user.click(within(copyDialog).getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(copy).toHaveBeenCalledWith(secret);
    expect(trigger).toHaveFocus();
    await user.type(screen.getByRole('searchbox'), 'New integration');
    expect(await screen.findByText('New integration')).toBeVisible();
    await user.click(trigger);
    expect(screen.getByLabelText('Secret key name')).toHaveValue('');
    expect(screen.queryByText('This key will never expire')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Expiration/ })).toHaveTextContent('Select expiration');
    expect(screen.queryByText(/^ak_demo_/)).not.toBeInTheDocument();
  });

  it('changes page size and keeps the controls available', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Default />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    await user.click(screen.getByRole('combobox', { name: /Results per page/ }));
    await user.click(screen.getByRole('option', { name: '20' }));
    expect(screen.getByRole('combobox', { name: /Results per page/ })).toHaveTextContent('20');
    expect(screen.getByRole('button', { name: 'Next API keys page' })).toBeDisabled();
    expect(screen.getAllByRole('row')).toHaveLength(13);
    await user.click(screen.getByRole('combobox', { name: /Results per page/ }));
    await user.click(screen.getByRole('option', { name: '10' }));
    expect(screen.getByText('1/2')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next API keys page' })).toBeEnabled();
  });

  it.each([FullProfile, Overlay])('creates and copies a key in the full profile (%#)', async Story => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(
      <MosaicProvider>
        <Story />
      </MosaicProvider>,
    );
    const manage = screen.queryByRole('button', { name: 'Manage account' });
    if (manage) {
      await user.click(manage);
    }
    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
    const trigger = screen.getByRole('button', { name: 'Create API key' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Add new API key' });
    await user.type(within(dialog).getByLabelText('Secret key name'), 'Full profile key');
    await user.click(within(dialog).getByRole('combobox', { name: /^Expiration/ }));
    await user.click(screen.getByRole('option', { name: 'Never' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add API Key' }));
    const copyDialog = await screen.findByRole('dialog', { name: 'Copy your API Key' });
    await waitFor(() => expect(within(copyDialog).getByRole('button', { name: 'Copy API key' })).toHaveFocus());
    await user.click(within(copyDialog).getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Copy your API Key' })).not.toBeInTheDocument());
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('ak_demo_'));
    expect(screen.getByText('Full profile key')).toBeVisible();
    expect(trigger).toHaveFocus();
  });

  it('updates the expiration label after each selection', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Default />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    const trigger = screen.getByRole('combobox', { name: /^Expiration/ });

    for (const label of ['7 Days', '30 Days', 'Never']) {
      await user.click(trigger);
      await user.click(screen.getByRole('option', { name: label }));
      expect(trigger).toHaveTextContent(label);
    }
  });

  it('keeps the key visible after a copy failure and saves the selected expiration', async () => {
    const user = userEvent.setup();
    const copy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Denied'))
      .mockResolvedValue();
    render(
      <MosaicProvider
        localization={{ overrides: { 'userProfileApiKeysPanel.copyError': 'Impossible de copier cette clé.' } }}
      >
        <Default />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    await user.type(screen.getByLabelText('Secret key name'), 'Expiring integration');
    await user.click(screen.getByRole('combobox', { name: /^Expiration/ }));
    await user.click(screen.getByRole('option', { name: '1 Year' }));
    const expectedExpiration = new Date();
    expectedExpiration.setFullYear(expectedExpiration.getFullYear() + 1);
    const expirationLabel = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(expectedExpiration);
    expect(screen.getByText(`This key will expire on ${expirationLabel}`)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add API Key' }));
    const dialog = await screen.findByRole('dialog', { name: 'Copy your API Key' });
    await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Impossible de copier cette clé.');
    expect(within(dialog).getByDisplayValue(/^ak_demo_/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(copy).toHaveBeenCalledTimes(2);
    expect(screen.getByText(`Expires ${expirationLabel}`)).toBeVisible();
  });

  it('sorts the proposed table across pages and clears selection when sorting changes', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <ProposedTable />
      </MosaicProvider>,
    );
    const names = () =>
      screen
        .getAllByRole('checkbox')
        .slice(1)
        .map(row => row.getAttribute('aria-label'));
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Staging' }));
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByText('1/2')).toBeVisible();
    expect(names()[0]).toBe('Select Analytics');
    expect(screen.getByRole('checkbox', { name: 'Select all API keys' })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    expect(names()).toEqual(['Select Support tools', 'Select Web app']);
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'descending');
    expect(names()[0]).toBe('Select Web app');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('aria-sort');
    expect(names().slice(0, 2)).toEqual(['Select Web app', 'Select Mobile app']);
    await user.click(screen.getByRole('button', { name: 'Last used' }));
    expect(names().slice(0, 4)).toEqual(['Select Backups', 'Select Reports', 'Select Analytics', 'Select Web app']);
    expect(screen.getByRole('cell', { name: '11 minutes ago' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Last used' }));
    expect(names().slice(0, 4)).toEqual(['Select Web app', 'Select Analytics', 'Select Reports', 'Select Backups']);
    expect(screen.getByRole('columnheader', { name: 'Last used' })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('aria-sort');
    await user.click(screen.getByRole('button', { name: 'Date created' }));
    expect(screen.getByRole('columnheader', { name: 'Date created' })).toHaveAttribute('aria-sort', 'ascending');
    expect(names().slice(0, 2)).toEqual(['Select Web app', 'Select Mobile app']);
    await user.click(screen.getByRole('button', { name: 'Date created' }));
    expect(screen.getByRole('columnheader', { name: 'Date created' })).toHaveAttribute('aria-sort', 'descending');
    expect(names().slice(0, 2)).toEqual(['Select Local development', 'Select Staging']);
    expect(screen.getByRole('cell', { name: 'Jan 16, 2026' })).toBeVisible();
  });

  it('corrects the page after its last result is removed', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Default />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    for (const name of ['Staging', 'Local development']) {
      await user.click(screen.getByRole('button', { name: `Manage ${name}` }));
      await user.click(screen.getByRole('menuitem', { name: 'Revoke key' }));
      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByRole('textbox'), name);
      await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }
    expect(screen.getByText('Web app')).toBeVisible();
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(screen.getByRole('button', { name: 'Next API keys page' })).toBeDisabled();
  });

  it('changes the displayed page and debounces a trimmed search without showing bulk selection', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Default />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Date created' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Name' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Last used' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next API keys page' }));
    expect(screen.getByText('2/2')).toBeVisible();
    const input = screen.getByRole('searchbox');
    await user.type(input, '  Web app  ');
    expect(input).toHaveValue('  Web app  ');
    await waitFor(() => expect(screen.getByRole('table')).toHaveTextContent('Web app'));
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Next API keys page' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(11));
  });
});
