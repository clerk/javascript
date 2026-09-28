import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { ReverificationController } from '../reverification.controller';
import { ReverificationDialog } from '../reverification.dialog';

function ready(phase: 'active' | 'retrying', onCancel = vi.fn()): ReverificationController {
  return {
    status: 'ready',
    phase,
    step: 'password',
    value: '',
    onValueChange: vi.fn(),
    isPending: phase === 'retrying',
    onSubmit: vi.fn(),
    onShowMethods: vi.fn(),
    onShowHelp: vi.fn(),
    onBack: vi.fn(),
    onEmailSupport: vi.fn(),
    onResend: vi.fn(),
    canResend: true,
    methods: [],
    onSelectMethod: vi.fn(),
    onCancel,
  };
}

describe('ReverificationDialog', () => {
  it('opens a named card dialog for the active password challenge', () => {
    render(
      <MosaicProvider>
        <ReverificationDialog {...ready('active')} />
      </MosaicProvider>,
    );

    expect(screen.getByRole('dialog', { name: 'Verification required' })).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
  });

  it('cancels the active challenge when dismissed', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <MosaicProvider>
        <ReverificationDialog {...ready('active', onCancel)} />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('keeps the retrying challenge open and does not cancel it', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <MosaicProvider>
        <ReverificationDialog {...ready('retrying', onCancel)} />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('stays closed when the flow is inactive', () => {
    render(
      <MosaicProvider>
        <ReverificationDialog
          status='idle'
          phase='inactive'
        />
      </MosaicProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('returns focus to the action after an async challenge is cancelled', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [phase, setPhase] = useState<'inactive' | 'active'>('inactive');
      const actionRef = useRef<HTMLButtonElement>(null);
      const controller: ReverificationController =
        phase === 'active' ? ready('active', () => setPhase('inactive')) : { status: 'idle', phase: 'inactive' };

      return (
        <>
          <button
            ref={actionRef}
            type='button'
            onClick={() => {
              void Promise.resolve().then(() => setPhase('active'));
            }}
          >
            Connect
          </button>
          <ReverificationDialog
            {...controller}
            finalFocus={actionRef}
          />
        </>
      );
    }

    render(
      <MosaicProvider>
        <Harness />
      </MosaicProvider>,
    );

    const action = screen.getByRole('button', { name: 'Connect' });
    await user.click(action);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(action).toHaveFocus());
  });
});
