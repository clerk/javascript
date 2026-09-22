import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { OrganizationProfileSaveError } from '../organization-profile.types';
import type { OrganizationProfileGeneralPanelViewProps } from '../organization-profile-general-panel.view';
import { OrganizationProfileGeneralPanelView } from '../organization-profile-general-panel.view';

function renderPanel(overrides: Partial<OrganizationProfileGeneralPanelViewProps> = {}) {
  const props: OrganizationProfileGeneralPanelViewProps = {
    name: 'Clerk',
    slug: 'clerkWorkspace-177654156132154',
    memberCount: 20,
    ...overrides,
  };
  return render(
    <MosaicProvider>
      <OrganizationProfileGeneralPanelView {...props} />
    </MosaicProvider>,
  );
}

describe('organization profile general panel', () => {
  it('shows the workspace details as read-only when nothing can be edited', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Workspace details' })).toBeVisible();
    expect(screen.getByText('Clerk')).toBeVisible();
    expect(screen.getByText('clerkWorkspace-177654156132154')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
  });

  it('hides the danger zone when neither action is available', () => {
    renderPanel();

    expect(screen.queryByRole('heading', { name: 'Danger zone' })).not.toBeInTheDocument();
  });

  it('offers a copy button for the slug, and keeps the full value reachable when it truncates', () => {
    renderPanel();

    expect(screen.getByRole('button', { name: 'Copy slug' })).toBeVisible();
    expect(screen.getByText('clerkWorkspace-177654156132154')).toHaveAttribute(
      'title',
      'clerkWorkspace-177654156132154',
    );
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

  it('names the slug field without showing a label, and explains the change under the title', async () => {
    const user = userEvent.setup();
    renderPanel({ onSubmitSlug: vi.fn().mockResolvedValue(undefined) });

    await user.click(screen.getByRole('button', { name: 'Edit slug' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('textbox', { name: 'Slug' })).toBeVisible();
    expect(within(dialog).getByText('Slug')).toHaveAttribute('data-visually-hidden', '');
    expect(
      within(dialog).getByText('A unique identifier used in workspace URLs. Changing it may break existing links.'),
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
    const onSubmitSlug = vi.fn().mockRejectedValue(new OrganizationProfileSaveError('Slug is taken', 'slug'));
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
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Something went wrong.');
    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toBeValid();
  });

  it('keeps each danger action inert until the workspace name is typed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    renderPanel({ onDelete });

    await user.click(screen.getByRole('button', { name: 'Delete Workspace' }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Delete Workspace' });
    expect(dialog).toHaveTextContent(
      'Are you sure you want to delete Clerk? This removes 20 members and permanently deletes all Workspace data.',
    );

    await user.click(confirm);
    expect(onDelete).not.toHaveBeenCalled();

    await user.type(within(dialog).getByRole('textbox'), 'Clerk');
    await user.click(confirm);

    await waitFor(() => expect(onDelete).toHaveBeenCalled());
  });

  it('shows both danger rows and asks for the name in each', async () => {
    const user = userEvent.setup();
    const onLeave = vi.fn().mockResolvedValue(undefined);
    renderPanel({ onLeave, onDelete: vi.fn().mockResolvedValue(undefined) });

    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Leave Workspace' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Leave Workspace' })).toBeVisible();
    expect(within(dialog).getByText(/You will lose access to this workspace and its applications\./)).toBeVisible();
    expect(within(dialog).getByText('Type “Clerk” below to continue')).toBeVisible();

    await user.type(within(dialog).getByRole('textbox'), 'Clerk');
    await user.click(within(dialog).getByRole('button', { name: 'Leave Workspace' }));

    await waitFor(() => expect(onLeave).toHaveBeenCalled());
  });
});
