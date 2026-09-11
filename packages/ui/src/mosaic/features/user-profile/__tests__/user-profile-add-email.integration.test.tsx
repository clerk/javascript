import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';

describe('profile add email', () => {
  it.each([false, true])(
    'owns the dialog and returns focus with multiple accounts = %s',
    async allowMultipleAccounts => {
      const user = userEvent.setup();
      const onSend = vi.fn(() => Promise.resolve());
      const onVerify = vi.fn(() => Promise.resolve());
      render(
        <MosaicProvider>
          <UserProfileProfilePanelView
            allowMultipleAccounts={allowMultipleAccounts}
            name='Test'
            username='test'
            emails={[]}
            phones={[]}
            onSendEmailCode={onSend}
            onVerifyEmailCode={onVerify}
          />
        </MosaicProvider>,
      );
      const trigger = screen.getByRole('button', { name: 'Add email' });
      await user.click(trigger);
      expect(screen.getByRole('dialog', { name: 'Add email' })).toBeInTheDocument();
      await user.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com');
      await user.click(screen.getByRole('button', { name: 'Send code' }));
      await waitFor(() => expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveFocus());
      await user.keyboard('123456');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onSend).toHaveBeenCalledExactlyOnceWith('new@example.com');
      expect(onVerify).toHaveBeenCalledExactlyOnceWith('new@example.com', '123456');
      await waitFor(() => expect(trigger).toHaveFocus());
    },
  );
});
