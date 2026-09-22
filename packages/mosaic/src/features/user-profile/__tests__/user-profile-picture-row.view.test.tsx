import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfilePictureRowViewProps } from '../user-profile-account-section/user-profile-picture-row.view';
import { UserProfilePictureRowView } from '../user-profile-account-section/user-profile-picture-row.view';

function renderView(overrides: Partial<UserProfilePictureRowViewProps> = {}) {
  return render(
    <MosaicProvider>
      <UserProfilePictureRowView
        name='Preston Booth'
        {...overrides}
      />
    </MosaicProvider>,
  );
}

describe('UserProfilePictureRowView', () => {
  it('shows why removing the picture failed', async () => {
    const user = userEvent.setup();
    renderView({
      hasImage: true,
      onRemove: vi.fn().mockResolvedValue({ error: { global: { code: 'action_blocked' } } }),
    });

    await user.click(screen.getByRole('button', { name: 'Manage profile picture' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove avatar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("This action couldn't be completed.");
  });

  it('replaces a rejected pick with the result of a removal', async () => {
    const user = userEvent.setup();
    const { container } = renderView({
      hasImage: true,
      onChange: vi.fn(),
      onRemove: vi.fn().mockResolvedValue({ error: { global: { code: 'action_blocked' } } }),
    });
    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('expected a file input');
    }

    const tooBig = new File(['x'], 'big.png', { type: 'image/png' });
    Object.defineProperty(tooBig, 'size', { value: 11 * 1024 * 1024 });
    await user.upload(input, tooBig);
    const rejection = screen.getByRole('alert').textContent;

    await user.click(screen.getByRole('button', { name: 'Manage profile picture' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove avatar' }));

    await waitFor(() => expect(screen.getByRole('alert')).not.toHaveTextContent(rejection ?? ''));
    expect(screen.getByRole('alert')).toHaveTextContent("This action couldn't be completed.");
  });

  it('offers Upload while the avatar is only a generated default', () => {
    renderView({
      hasImage: false,
      imageUrl: 'https://img.clerk.com/generated-default.png',
      onChange: vi.fn(),
      onRemove: vi.fn(),
    });

    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage profile picture' })).toBeNull();
  });

  it('offers change and remove in a menu once a profile picture is set', async () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    const user = userEvent.setup();
    renderView({
      hasImage: true,
      imageUrl: 'https://example.com/avatar.png',
      onChange,
      onRemove,
    });

    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Manage profile picture' }));

    expect(screen.getByRole('menuitem', { name: 'Change avatar' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove avatar' }));

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
