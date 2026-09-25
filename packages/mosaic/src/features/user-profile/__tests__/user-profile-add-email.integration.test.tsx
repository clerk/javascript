import { createDeferredPromise } from '@clerk/shared/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';

describe('profile add email', () => {
  it.each([false, true])(
    'owns the dialog and returns focus with multiple accounts = %s',
    async allowMultipleAccounts => {
      const user = userEvent.setup();
      const start = vi.fn(() => ({ method: 'code', sent: Promise.resolve() }) as const);
      const verifyCode = vi.fn(() => Promise.resolve());
      const onCreate = vi.fn(() => Promise.resolve({ start, verifyCode }));
      render(
        <MosaicProvider>
          <UserProfileProfilePanelView
            allowMultipleAccounts={allowMultipleAccounts}
            name='Test'
            username='test'
            emails={[]}
            phones={[]}
            onCreateEmail={onCreate}
            getEmailVerifier={() => ({ start, verifyCode })}
          />
        </MosaicProvider>,
      );
      const trigger = screen.getByRole('button', { name: 'Add email' });
      await user.click(trigger);
      expect(screen.getByRole('dialog', { name: 'Add email' })).toBeInTheDocument();
      await user.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
      await user.click(screen.getByRole('button', { name: 'Continue' }));
      const codeInput = await screen.findByRole('textbox', { name: 'Verification code' });
      await waitFor(() => expect(codeInput).toHaveFocus());
      await user.keyboard('123456');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onCreate).toHaveBeenCalledExactlyOnceWith('new@example.com');
      expect(start).toHaveBeenCalledOnce();
      expect(verifyCode).toHaveBeenCalledExactlyOnceWith('123456');
      await waitFor(() => expect(trigger).toHaveFocus());
    },
  );

  it('verifies an unverified email from its menu and returns focus to the menu', async () => {
    const user = userEvent.setup();
    const start = vi.fn(() => ({ method: 'code', sent: Promise.resolve() }) as const);
    const verifyCode = vi.fn(() => Promise.resolve());
    const getEmailVerifier = vi.fn(() => ({ start, verifyCode }));
    render(
      <MosaicProvider>
        <UserProfileProfilePanelView
          allowMultipleAccounts
          name='Test'
          username='test'
          emails={[{ id: 'email_2', value: 'other@example.com', isDefault: false, isVerified: false }]}
          phones={[]}
          getEmailVerifier={getEmailVerifier}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Add email' })).not.toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Manage other@example.com' });
    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    expect(dialog).toHaveTextContent('other@example.com');
    expect(getEmailVerifier).toHaveBeenCalledExactlyOnceWith('email_2');
    await waitFor(() => expect(start).toHaveBeenCalledOnce());
    await user.keyboard('123456');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(verifyCode).toHaveBeenCalledExactlyOnceWith('123456');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('waits for the emailed link, then closes and stops waiting', async () => {
    const user = userEvent.setup();
    const verified = createDeferredPromise();
    const cancel = vi.fn();
    render(
      <MosaicProvider>
        <UserProfileProfilePanelView
          allowMultipleAccounts
          name='Test'
          username='test'
          emails={[{ id: 'email_2', value: 'other@example.com', isDefault: false, isVerified: false }]}
          phones={[]}
          getEmailVerifier={() => ({
            start: () => ({ method: 'link', verified: verified.promise.then(() => undefined), cancel }),
            verifyCode: vi.fn(),
          })}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage other@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    await waitFor(() => expect(dialog).toHaveTextContent('Open the link we sent to other@example.com'));
    expect(screen.queryByRole('textbox', { name: 'Verification code' })).not.toBeInTheDocument();
    verified.resolve();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('verifies an SSO email by connecting to the provider for its domain', async () => {
    const user = userEvent.setup();
    const connect = vi.fn();
    render(
      <MosaicProvider>
        <UserProfileProfilePanelView
          allowMultipleAccounts
          name='Test'
          username='test'
          emails={[{ id: 'email_2', value: 'person@acme.co', isDefault: false, isVerified: false }]}
          phones={[]}
          getEmailVerifier={() => ({
            start: () => ({ method: 'sso', verified: new Promise(() => {}), cancel: vi.fn(), connect }),
            verifyCode: vi.fn(),
          })}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage person@acme.co' }));
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    const dialog = await screen.findByRole('dialog', { name: 'Verify your email' });
    await waitFor(() => expect(dialog).toHaveTextContent('acme.co'));
    await user.click(screen.getByRole('button', { name: 'Connect' }));
    expect(connect).toHaveBeenCalledOnce();
  });

  it('does not add the username as an email', async () => {
    const user = userEvent.setup();
    const verifier = { start: () => ({ method: 'code', sent: Promise.resolve() }) as const, verifyCode: vi.fn() };
    const onCreate = vi.fn(() => Promise.resolve(verifier));
    render(
      <MosaicProvider>
        <UserProfileProfilePanelView
          name='Test'
          username='person@example.com'
          emails={[]}
          phones={[]}
          onCreateEmail={onCreate}
          getEmailVerifier={() => verifier}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Add email' }));
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'person@example.com');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });
});
