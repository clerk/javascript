import '@testing-library/jest-dom/vitest';

import { Dialog } from '@clerk/mosaic/components/dialog';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { UserProfileSecurityPanelView } from '@clerk/mosaic/features/user-profile/user-profile-security-panel.view';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useUserProfileFixture } from './user-profile';
import { useUserProfileMfaExample } from './user-profile-mfa-example';

describe('shared MFA examples', () => {
  it('finishes authenticator setup inside the Profile overlay without closing the Profile', async () => {
    const user = userEvent.setup();
    function Example() {
      const { pages } = useUserProfileFixture();
      return (
        <MosaicProvider>
          <Dialog.Root defaultOpen>
            <Dialog.Popup variant='profile'>
              <UserProfileView
                activePage='security'
                onPageChange={vi.fn()}
                pages={pages}
              />
            </Dialog.Popup>
          </Dialog.Root>
        </MosaicProvider>
      );
    }
    render(<Example />);
    const profile = screen.getByRole('dialog');
    const add = within(profile).getByRole('button', { name: 'Add verification method' });
    await user.click(add);
    const setup = screen.getByRole('dialog', { name: 'Add 2-step verification' });
    await user.click(within(setup).getByRole('button', { name: /Authenticator app/ }));
    await user.type(await within(setup).findByRole('textbox', { name: 'Verification code' }), '123456');
    await within(setup).findByRole('list', { name: 'Backup codes' });
    await user.click(within(setup).getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(setup).not.toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBe(profile);
    expect(add).toHaveFocus();
    expect(within(profile).getByRole('button', { name: 'Manage Authenticator app' })).toBeVisible();
  });

  it.each(['section', 'security', 'profile'] as const)(
    'uses the enrollment and backup-code flow in %s',
    async surface => {
      const user = userEvent.setup();
      const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
      function Example() {
        const mfa = useUserProfileMfaExample();
        const { pages } = useUserProfileFixture();
        return (
          <MosaicProvider>
            {surface === 'section' ? (
              <UserProfileMfaSectionView {...mfa.section} />
            ) : surface === 'security' ? (
              <UserProfileSecurityPanelView {...pages.security} />
            ) : (
              <UserProfileView
                activePage='security'
                onPageChange={vi.fn()}
                pages={pages}
              />
            )}
          </MosaicProvider>
        );
      }
      render(<Example />);
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
    },
  );
});
