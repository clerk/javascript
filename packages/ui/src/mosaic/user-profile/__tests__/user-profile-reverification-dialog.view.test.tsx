import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import type { ReverificationChallengeState } from '../dialogs/flow.types';
import { ReverificationDialogView } from '../dialogs/reverification-dialog.view';

function Harness({
  isVerifying = false,
  strategy = 'email_code',
  onSubmit = vi.fn(),
}: {
  isVerifying?: boolean;
  strategy?: ReverificationChallengeState['strategy'];
  onSubmit?: () => void;
}) {
  const [code, setCode] = useState('');
  const state: ReverificationChallengeState = {
    strategy,
    identifier:
      strategy === 'email_code' ? 'i••••@clerk.dev' : strategy === 'phone_code' ? '+1 ••• ••• 4242' : undefined,
    value: code,
    status: isVerifying ? 'verifying' : 'idle',
    errors: {},
    resend: { isResending: false, secondsRemaining: 0 },
  };

  return (
    <MosaicProvider>
      <Dialog open>
        <ReverificationDialogView
          state={state}
          onCancel={vi.fn()}
          onResend={vi.fn()}
          onSubmit={onSubmit}
          onValueChange={setCode}
        />
      </Dialog>
    </MosaicProvider>
  );
}

describe('ReverificationDialogView', () => {
  it('submits a complete verification code', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Verification code'), '424242');

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('announces pending verification without changing the button label', () => {
    render(<Harness isVerifying />);

    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Verifying identity' })).toBeInTheDocument();
  });

  it('asks for an authenticator code without offering a resend', () => {
    render(<Harness strategy='totp' />);

    expect(screen.getByRole('textbox', { name: 'Verification code' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resend' })).not.toBeInTheDocument();
  });

  it('asks for a backup code as plain text', () => {
    render(<Harness strategy='backup_code' />);

    expect(screen.getByRole('textbox', { name: 'Backup code' })).toHaveAttribute('type', 'text');
    expect(screen.queryByRole('button', { name: 'Resend' })).not.toBeInTheDocument();
  });

  it('offers passkey verification without asking for a value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness
        strategy='passkey'
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Verify with passkey' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('represents factor selection, second-factor routing, and recovery states', async () => {
    const onSelectFactor = vi.fn();
    const user = userEvent.setup();
    const view = render(
      <MosaicProvider>
        <Dialog open>
          <ReverificationDialogView
            state={{
              strategy: 'password',
              step: 'select-first-factor',
              availableFactors: [
                { id: 'password', strategy: 'password', label: 'Password' },
                { id: 'email', strategy: 'email_code', label: 'Email code' },
              ],
              value: '',
              status: 'idle',
              errors: {},
              resend: { isResending: false, secondsRemaining: 0 },
            }}
            onCancel={vi.fn()}
            onResend={vi.fn()}
            onSelectFactor={onSelectFactor}
            onSubmit={vi.fn()}
            onValueChange={vi.fn()}
          />
        </Dialog>
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Email code' }));
    expect(onSelectFactor).toHaveBeenCalledWith('email');

    view.rerender(
      <MosaicProvider>
        <Dialog open>
          <ReverificationDialogView
            state={{
              strategy: 'email_code',
              step: 'unavailable',
              value: '',
              status: 'idle',
              errors: {},
              resend: { isResending: false, secondsRemaining: 0 },
            }}
            onCancel={vi.fn()}
            onResend={vi.fn()}
            onSubmit={vi.fn()}
            onValueChange={vi.fn()}
          />
        </Dialog>
      </MosaicProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Unable to verify' })).toBeInTheDocument();
  });
});
