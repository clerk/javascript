import { render, screen } from '@testing-library/react';
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
  it('renders and clears the error supplied by the section', () => {
    const { rerender } = renderView({ errorMessage: 'File size exceeds the maximum limit of 10MB.' });

    expect(screen.getByRole('alert')).toHaveTextContent('File size exceeds the maximum limit of 10MB.');

    rerender(
      <MosaicProvider>
        <UserProfilePictureRowView name='Preston Booth' />
      </MosaicProvider>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
