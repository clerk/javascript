import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { OrganizationProfileGeneralPanelViewProps } from '../organization-profile-general-panel.view';
import { OrganizationProfileGeneralPanelView } from '../organization-profile-general-panel.view';

function renderPanel(overrides: Partial<OrganizationProfileGeneralPanelViewProps> = {}) {
  const props: OrganizationProfileGeneralPanelViewProps = {
    name: 'Clerk',
    slug: 'clerk-workspace',
    membersCount: 20,
    onLogoChange: vi.fn(() => Promise.resolve()),
    onRemoveLogo: vi.fn(() => Promise.resolve()),
    onSubmitName: vi.fn(() => Promise.resolve()),
    onSubmitSlug: vi.fn(() => Promise.resolve()),
    onCopySlug: vi.fn(() => Promise.resolve()),
    onLeave: vi.fn(() => Promise.resolve()),
    onDelete: vi.fn(() => Promise.resolve()),
    ...overrides,
  };

  return {
    props,
    ...render(
      <MosaicProvider>
        <OrganizationProfileGeneralPanelView {...props} />
      </MosaicProvider>,
    ),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('OrganizationProfileGeneralPanelView', () => {
  it('renders workspace details and the danger zone', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workspace details' })).toBeInTheDocument();
    expect(screen.getByText('Clerk')).toBeInTheDocument();
    expect(screen.getByText('clerk-workspace')).toBeInTheDocument();
    expect(
      within(screen.getByText('clerk-workspace').closest('.cl-section-content') as HTMLElement).getByRole('button', {
        name: 'Copy',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave workspace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete workspace' })).toBeInTheDocument();
    expect(document.querySelector('.cl-avatar')).toHaveAttribute('data-shape', 'square');
  });

  it('uses callback presence to expose edits and destructive actions', () => {
    renderPanel({
      slug: undefined,
      onLogoChange: undefined,
      onRemoveLogo: undefined,
      onSubmitName: undefined,
      onSubmitSlug: undefined,
      onCopySlug: undefined,
      onLeave: undefined,
      onDelete: undefined,
    });

    expect(screen.queryByText('Slug')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Danger zone' })).not.toBeInTheDocument();
  });

  it('shows an enabled empty slug without a copy action', () => {
    renderPanel({ slug: '' });

    expect(screen.getByText('Not set')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('uploads supported logos and rejects unsupported files', async () => {
    const onLogoChange = vi.fn(() => Promise.resolve());
    const onLogoReject = vi.fn();
    const user = userEvent.setup();
    renderPanel({ onLogoChange, onLogoReject });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, new File(['logo'], 'logo.png', { type: 'image/png' }));
    await waitFor(() => expect(onLogoChange).toHaveBeenCalledOnce());

    fireEvent.change(input, { target: { files: [new File(['plain'], 'logo.txt', { type: 'text/plain' })] } });
    expect(onLogoReject).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('File type not supported');
  });

  it('offers change and remove after a logo has been uploaded', async () => {
    const onRemoveLogo = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderPanel({ hasImage: true, imageUrl: 'https://example.com/logo.png', onRemoveLogo });

    await user.click(screen.getByRole('button', { name: 'Manage logo' }));
    expect(screen.getByRole('menuitem', { name: 'Change logo' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove logo' }));
    await waitFor(() => expect(onRemoveLogo).toHaveBeenCalledOnce());
  });

  it('edits the workspace name and closes after a successful save', async () => {
    const onSubmitName = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderPanel({ onSubmitName });

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Edit workspace name' });
    const input = within(dialog).getByRole('textbox', { name: 'Name' });
    const save = within(dialog).getByRole('button', { name: 'Save changes' });

    expect(input).toHaveValue('Clerk');
    expect(save).toHaveAttribute('aria-disabled', 'true');
    await user.clear(input);
    await user.type(input, 'Clerk Inc.');
    await user.click(save);

    expect(onSubmitName).toHaveBeenCalledWith('Clerk Inc.');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit workspace name' })).not.toBeInTheDocument());
  });

  it('keeps the slug dialog open and shows a rejected API message under the field', async () => {
    const onSubmitSlug = vi.fn(() => Promise.reject(new Error('That workspace slug is already in use.')));
    const user = userEvent.setup();
    renderPanel({ onSubmitSlug });

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    const dialog = screen.getByRole('dialog', { name: 'Edit workspace slug' });
    const input = within(dialog).getByRole('textbox', { name: 'Slug' });

    expect(within(dialog).getByText(/Changing it may break existing links/)).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'new-slug');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByText('That workspace slug is already in use.')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('copies the slug and clears success feedback after two seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onCopySlug = vi.fn(() => Promise.resolve());
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPanel({ onCopySlug });

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(onCopySlug).toHaveBeenCalledWith('clerk-workspace');
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copied');

    await act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows copy failure feedback and keeps copy available', async () => {
    const onCopySlug = vi.fn(() => Promise.reject(new Error('Clipboard blocked')));
    const user = userEvent.setup();
    renderPanel({ onCopySlug });

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Couldn’t copy');
    expect(screen.getByRole('button', { name: 'Copy' })).not.toBeDisabled();
  });

  it('leaves only after an exact workspace-name confirmation', async () => {
    const onLeave = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderPanel({ onLeave });

    await user.click(screen.getByRole('button', { name: 'Leave workspace' }));
    const dialog = screen.getByRole('dialog', { name: 'Leave workspace' });
    const confirm = within(dialog).getByRole('button', { name: 'Leave workspace' });

    expect(confirm).toHaveAttribute('aria-disabled', 'true');
    await user.type(within(dialog).getByRole('textbox'), 'clerk');
    expect(confirm).toHaveAttribute('aria-disabled', 'true');
    await user.clear(within(dialog).getByRole('textbox'));
    await user.type(within(dialog).getByRole('textbox'), 'Clerk{Enter}');

    expect(onLeave).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Leave workspace' })).not.toBeInTheDocument());
  });

  it('includes the member count and explains a failed delete', async () => {
    const onDelete = vi.fn(() => Promise.reject(new Error('Delete is disabled.')));
    const user = userEvent.setup();
    renderPanel({ membersCount: 20, onDelete });

    await user.click(screen.getByRole('button', { name: 'Delete workspace' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete workspace' });
    expect(within(dialog).getByText(/This removes 20 members/)).toBeInTheDocument();

    await user.type(within(dialog).getByRole('textbox'), 'Clerk');
    await user.click(within(dialog).getByRole('button', { name: 'Delete workspace' }));

    expect(await within(dialog).findByText('Delete is disabled.')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Delete workspace' })).toBeInTheDocument();
  });
});
