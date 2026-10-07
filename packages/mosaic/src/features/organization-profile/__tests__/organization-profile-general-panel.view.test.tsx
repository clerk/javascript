import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import { SaveError } from '../../../utils/errors';
import type { OrganizationProfileGeneralPanelViewProps } from '../organization-profile-general-panel.view';
import { OrganizationProfileGeneralPanelView } from '../organization-profile-general-panel.view';

function renderPanel(overrides: Partial<OrganizationProfileGeneralPanelViewProps> = {}) {
  const props: OrganizationProfileGeneralPanelViewProps = {
    name: 'Clerk',
    slug: 'clerk-177654156132154',
    ...overrides,
  };
  return render(
    <MosaicProvider>
      <OrganizationProfileGeneralPanelView {...props} />
    </MosaicProvider>,
  );
}

describe('organization profile general panel', () => {
  it('shows the organization details as read-only when nothing can be edited', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Organization details' })).toBeVisible();
    expect(screen.getByText('Clerk')).toBeVisible();
    expect(screen.getByText('clerk-177654156132154')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
  });

  it('saves a new name', async () => {
    const user = userEvent.setup();
    const onSubmitName = vi.fn().mockResolvedValue(undefined);
    renderPanel({ onSubmitName });

    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    const field = await screen.findByRole('textbox', { name: 'Name' });
    await user.clear(field);
    await user.type(field, 'Clerk Inc');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmitName).toHaveBeenCalledWith('Clerk Inc'));
  });

  it('allows an optional slug to be cleared', async () => {
    const user = userEvent.setup();
    const onSubmitSlug = vi.fn().mockResolvedValue(undefined);
    renderPanel({ onSubmitSlug });

    await user.click(screen.getByRole('button', { name: 'Edit slug' }));
    await user.clear(await screen.findByRole('textbox', { name: 'Slug' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmitSlug).toHaveBeenCalledWith(''));
  });

  it('names the slug field without showing a label, and explains the change under the title', async () => {
    const user = userEvent.setup();
    renderPanel({ onSubmitSlug: vi.fn().mockResolvedValue(undefined) });

    await user.click(screen.getByRole('button', { name: 'Edit slug' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('textbox', { name: 'Slug' })).toBeVisible();
    expect(within(dialog).getByText('Slug')).toHaveAttribute('data-visually-hidden', '');
    expect(
      within(dialog).getByText('A unique identifier used in organization URLs. Changing it may break existing links.'),
    ).toBeVisible();
  });

  it('names the name field without showing a label', async () => {
    const user = userEvent.setup();
    renderPanel({ onSubmitName: vi.fn().mockResolvedValue(undefined) });

    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toBeVisible();
    expect(within(dialog).getByText('Name')).toHaveAttribute('data-visually-hidden', '');
  });

  it('shows a rejected save under the field it names and leaves the dialog open', async () => {
    const user = userEvent.setup();
    const onSubmitSlug = vi
      .fn()
      .mockRejectedValue(new SaveError({ fields: { slug: { code: 'slug_taken', message: 'Slug is taken' } } }));
    renderPanel({ onSubmitSlug });

    await user.click(screen.getByRole('button', { name: 'Edit slug' }));
    const field = await screen.findByRole('textbox', { name: 'Slug' });
    await user.type(field, '-2');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('Slug is taken')).toBeVisible();
    expect(within(dialog).getByRole('textbox', { name: 'Slug' })).toBeEnabled();
    expect(within(dialog).getByRole('textbox', { name: 'Slug' })).toBeInvalid();
  });

  it('shows an unscoped rejection in the banner instead', async () => {
    const user = userEvent.setup();
    const onSubmitName = vi.fn().mockRejectedValue(new Error('Something went wrong.'));
    renderPanel({ onSubmitName });

    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    await user.type(await screen.findByRole('textbox', { name: 'Name' }), '!');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    const dialog = await screen.findByRole('dialog');
    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'),
    );
    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toBeValid();
  });
});
