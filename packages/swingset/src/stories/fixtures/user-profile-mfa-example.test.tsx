import '@testing-library/jest-dom/vitest';

import { Dialog } from '@clerk/mosaic/components/dialog';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useUserProfileFixture } from './user-profile';

function ProfileExample({ overlay = false }: { overlay?: boolean }) {
  const { pages } = useUserProfileFixture();
  const profile = (
    <UserProfileView
      activePage='security'
      onPageChange={vi.fn()}
      pages={pages}
    />
  );
  return (
    <MosaicProvider>
      {overlay ? (
        <Dialog.Root defaultOpen>
          <Dialog.Popup variant='profile'>{profile}</Dialog.Popup>
        </Dialog.Root>
      ) : (
        profile
      )}
    </MosaicProvider>
  );
}

describe('Profile MFA flows', () => {
  it('retries copying and verification, then finishes authenticator setup without closing the Profile overlay', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Clipboard unavailable'))
      .mockResolvedValue();
    render(<ProfileExample overlay />);
    const profile = screen.getByRole('dialog');
    const add = within(profile).getByRole('button', { name: 'Add verification method' });
    await user.click(add);
    const setup = screen.getByRole('dialog', { name: 'Add 2-step verification' });
    await user.click(within(setup).getByRole('button', { name: /Authenticator app/ }));
    await user.click(within(setup).getByRole('button', { name: 'Can’t scan? View setup key' }));
    await user.click(within(setup).getByRole('button', { name: 'Copy setup key' }));
    expect(await within(setup).findByRole('alert')).toHaveTextContent('Could not copy. Please try again.');
    await user.click(within(setup).getByRole('button', { name: 'Copy setup key' }));
    expect(within(setup).getByRole('status', { name: 'Copy feedback' })).toHaveTextContent('Copied');
    const code = within(setup).getByRole('textbox', { name: 'Verification code' });
    await user.type(code, '000000');
    expect(await within(setup).findByText('That code is incorrect. Try again.')).toBeVisible();
    expect(within(setup).getByRole('textbox', { name: 'Setup key' })).toBeVisible();
    await user.clear(code);
    await user.type(code, '123456');
    await within(setup).findByRole('list', { name: 'Backup codes' });
    await user.click(within(setup).getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(setup).not.toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBe(profile);
    expect(add).toHaveFocus();
    expect(within(profile).getByRole('button', { name: 'Manage Authenticator app' })).toBeVisible();
  });

  it('retries SMS verification in one dialog, saves backup codes, and regenerates them', async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<ProfileExample />);
    const add = screen.getByRole('button', { name: 'Add verification method' });
    await user.click(add);
    const dialog = screen.getByRole('dialog', { name: 'Add 2-step verification' });
    await user.click(within(dialog).getByRole('button', { name: /SMS verification/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await user.type(code, '000000');
    expect(await screen.findByText('That code is incorrect. Try again.')).toBeVisible();
    expect(screen.getByRole('dialog')).toBe(dialog);
    await user.clear(code);
    await user.type(code, '123456');
    await screen.findByRole('list', { name: 'Backup codes' });
    expect(screen.getByRole('dialog', { name: 'Save your backup codes' })).toBe(dialog);
    await user.click(screen.getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(copy).toHaveBeenCalledOnce();
    expect(add).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    expect(await screen.findByText('demo-new-01')).toBeVisible();
  });
});
