import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileAuthenticatorSetupView } from '../user-profile-authenticator-setup.view';

const setup = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset',
};

function renderView() {
  return render(
    <MosaicProvider>
      <Dialog.Root>
        <Dialog.Trigger>Set up authenticator</Dialog.Trigger>
        <Dialog.Popup variant='card'>
          <Card.Root renderBranding={false}>
            <UserProfileAuthenticatorSetupView {...setup} />
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    </MosaicProvider>,
  );
}

describe('Authenticator setup', () => {
  it('switches between scanning and manual setup using the same supplied credentials', async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByRole('button', { name: 'Set up authenticator' }));

    expect(screen.getByRole('heading', { name: 'Add an authenticator app' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Can’t scan? View setup key' }));

    expect(screen.queryByRole('img', { name: 'Authenticator setup QR code' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveValue(setup.secret);
    expect(screen.getByRole('textbox', { name: 'Setup URI' })).toHaveValue(setup.uri);
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: 'Setup URI' })).toHaveAttribute('readonly');

    await user.click(screen.getByRole('button', { name: 'Scan QR code instead' }));
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Can’t scan? View setup key' }));
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveValue(setup.secret);
    expect(screen.getByRole('textbox', { name: 'Setup URI' })).toHaveValue(setup.uri);
  });

  it('supports keyboard toggling and starts with the QR code again after dismissal', async () => {
    const user = userEvent.setup();
    renderView();
    const trigger = screen.getByRole('button', { name: 'Set up authenticator' });
    await user.click(trigger);
    await user.tab();
    const toggle = screen.getByRole('button', { name: 'Can’t scan? View setup key' });
    expect(toggle).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Scan QR code instead' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
